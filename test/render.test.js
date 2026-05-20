import { test } from "node:test";
import assert from "node:assert/strict";
import { Vec3 } from "../src/math/vec3.js";
import { Camera } from "../src/engine/camera.js";
import { Scene } from "../src/engine/scene.js";
import { Object3D } from "../src/engine/object3d.js";
import { Geometry } from "../src/engine/geometry.js";
import { Engine } from "../src/engine/engine.js";

/**
 * The renderer needs a browser canvas, so these tests drive it through a
 * minimal mock 2D context that just tallies the drawing calls. That is enough
 * to exercise the whole projection / culling / painter's-sort pipeline
 * headlessly.
 */
function mockContext() {
  const calls = { fill: 0, stroke: 0, fillRect: 0 };
  return {
    calls,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    setTransform() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
    fillRect() {
      calls.fillRect++;
    },
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    fill() {
      calls.fill++;
    },
    stroke() {
      calls.stroke++;
    },
  };
}

function mockCanvas(width = 800, height = 600) {
  const ctx = mockContext();
  return {
    ctx,
    clientWidth: width,
    clientHeight: height,
    width,
    height,
    getContext() {
      return ctx;
    },
  };
}

function withWindow(fn) {
  const had = "window" in globalThis;
  const prev = globalThis.window;
  globalThis.window = { devicePixelRatio: 1 };
  try {
    return fn();
  } finally {
    if (had) globalThis.window = prev;
    else delete globalThis.window;
  }
}

function makeScene() {
  const camera = new Camera({ position: new Vec3(6, 5, 8) });
  camera.lookAt(Vec3.zero());
  const scene = new Scene({ camera });
  scene.add(new Object3D({ mesh: Geometry.box(2, 2, 2) }));
  return scene;
}

test("renderer culls back faces and draws the visible ones", () => {
  withWindow(() => {
    const canvas = mockCanvas();
    const engine = new Engine(canvas, { scene: makeScene() });
    engine.step(0);

    const { stats } = engine.renderer;
    assert.equal(stats.faces, 12, "a cube submits 12 triangles");
    assert.ok(stats.drawn > 0, "some faces survive culling");
    assert.ok(stats.drawn < 12, "back faces are culled");
    assert.equal(
      canvas.ctx.calls.fill,
      stats.drawn,
      "one fill per drawn triangle",
    );
    assert.ok(canvas.ctx.calls.fillRect > 0, "background was painted");
  });
});

test("wireframe mode strokes instead of filling", () => {
  withWindow(() => {
    const canvas = mockCanvas();
    const engine = new Engine(canvas, { scene: makeScene() });
    engine.renderer.mode = "wireframe";
    engine.step(0);
    assert.equal(canvas.ctx.calls.fill, 0, "no fills in wireframe mode");
    assert.ok(canvas.ctx.calls.stroke > 0, "edges are stroked");
  });
});

test("an empty scene still paints the background without error", () => {
  withWindow(() => {
    const canvas = mockCanvas();
    const scene = new Scene({ camera: new Camera() });
    const engine = new Engine(canvas, { scene });
    engine.step(0);
    assert.equal(engine.renderer.stats.drawn, 0, "nothing to draw");
    assert.ok(canvas.ctx.calls.fillRect > 0, "background still painted");
  });
});

test("engine.step advances time and frame count", () => {
  withWindow(() => {
    const engine = new Engine(mockCanvas(), { scene: makeScene() });
    engine.step(0.5);
    engine.step(0.5);
    assert.equal(engine.frame, 2, "two frames stepped");
    assert.ok(Math.abs(engine.time - 1) < 1e-9, "time accumulated");
  });
});
