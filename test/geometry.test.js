import { test } from "node:test";
import assert from "node:assert/strict";
import { Geometry } from "../src/engine/geometry.js";
import { near } from "./helpers.js";

/**
 * The signed volume of a closed triangle mesh, via the divergence theorem.
 * A positive result means every face winds counter-clockwise as seen from
 * outside — exactly the convention the renderer's back-face culling needs.
 */
function signedVolume(mesh) {
  let vol = 0;
  for (const [i, j, k] of mesh.faces) {
    const a = mesh.vertices[i];
    const b = mesh.vertices[j];
    const c = mesh.vertices[k];
    vol += a.dot(b.cross(c));
  }
  return vol / 6;
}

test("box has the expected vertex and face counts", () => {
  const box = Geometry.box(1, 1, 1);
  assert.equal(box.vertices.length, 8, "8 vertices");
  assert.equal(box.faces.length, 12, "12 triangles");
});

test("box faces wind outward and enclose the right volume", () => {
  const vol = signedVolume(Geometry.box(2, 3, 4));
  near(vol, 24, 1e-9, "box volume = 2·3·4");
});

test("octahedron faces wind outward", () => {
  const octa = Geometry.octahedron(1);
  assert.equal(octa.vertices.length, 6);
  assert.equal(octa.faces.length, 8);
  near(signedVolume(octa), 4 / 3, 1e-9, "octahedron volume");
});

test("sphere faces wind outward and approximate the analytic volume", () => {
  const vol = signedVolume(Geometry.sphere(1, 48, 32));
  const exact = (4 / 3) * Math.PI;
  assert.ok(vol > 0, "outward winding");
  assert.ok(Math.abs(vol - exact) / exact < 0.02, `sphere volume ${vol}`);
});

test("torus faces wind outward and approximate the analytic volume", () => {
  const R = 1.2;
  const r = 0.4;
  const vol = signedVolume(Geometry.torus(R, r, 64, 32));
  const exact = 2 * Math.PI * Math.PI * R * r * r;
  assert.ok(vol > 0, "outward winding");
  assert.ok(Math.abs(vol - exact) / exact < 0.02, `torus volume ${vol}`);
});

test("torus knot builds a closed, outward-wound tube", () => {
  const knot = Geometry.torusKnot(1, 0.3, 120, 12, 2, 3);
  assert.ok(knot.vertices.length > 0, "has vertices");
  assert.ok(knot.faces.length > 0, "has faces");
  assert.ok(signedVolume(knot) > 0, "outward winding");
  for (const v of knot.vertices) {
    assert.ok(Number.isFinite(v.x + v.y + v.z), "no NaN vertices");
  }
});

test("grid is line geometry with no triangles", () => {
  const grid = Geometry.grid(10, 5);
  assert.equal(grid.faces.length, 0, "no faces");
  assert.equal(grid.lines.length, 12, "(5+1) lines in each of 2 directions");
});
