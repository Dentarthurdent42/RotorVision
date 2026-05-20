/**
 * RotorVision demo — a scene whose every rotation is a rotor.
 *
 *   - The central torus knot spins in a tilted *plane* (a bivector), never an
 *     axis.
 *   - Five satellites are children of one orbit node; spinning that single
 *     node orbits them all, because rotor transforms compose straight down the
 *     scene graph.
 *   - A moon is a child of a satellite — a three-deep hierarchy resolved with
 *     nothing but rotor multiplication.
 *   - The camera rig itself is positioned with rotors.
 *
 * The HUD reads the central knot's live rotor so you can watch the four
 * numbers (one scalar + three bivector coefficients) that encode its
 * orientation.
 */
import {
  Engine,
  Scene,
  Camera,
  Object3D,
  Geometry,
  Rotor,
  Bivector,
  Vec3,
} from "./index.js";

const canvas = document.getElementById("view");

const camera = new Camera({ fov: Math.PI / 3, near: 0.1, far: 120 });
const scene = new Scene({
  camera,
  background: { top: "#161d2e", bottom: "#070a12" },
  ambient: 0.26,
  lightDirection: new Vec3(-0.45, -1, -0.35),
  lightIntensity: 1.05,
});

// --- Ground grid --------------------------------------------------------
scene.add(
  new Object3D({
    name: "grid",
    mesh: Geometry.grid(48, 24, -4.2),
    material: { color: { r: 58, g: 84, b: 120 }, wireframe: true },
  }),
);

// --- Central torus knot -------------------------------------------------
const knot = scene.add(
  new Object3D({
    name: "knot",
    mesh: Geometry.torusKnot(2.4, 0.52, 190, 14, 2, 3),
    material: { color: { r: 92, g: 224, b: 214 } },
  }),
);
// The plane the knot turns in: a tilted bivector, not an axis.
const knotPlane = new Bivector(0.34, 0.0, 1.0);

// --- Orbiting satellites ------------------------------------------------
const orbitNode = scene.add(new Object3D({ name: "orbit" }));
const RING = 7.6;

const satelliteDefs = [
  {
    name: "cube",
    mesh: Geometry.box(2, 2, 2),
    color: { r: 244, g: 146, b: 92 },
    plane: new Bivector(0, 0, 1),
    rate: 1.4,
  },
  {
    name: "sphere",
    mesh: Geometry.sphere(1.25, 24, 16),
    color: { r: 150, g: 162, b: 244 },
    plane: new Bivector(1, 0, 0),
    rate: 1.0,
  },
  {
    name: "octahedron",
    mesh: Geometry.octahedron(1.5),
    color: { r: 244, g: 206, b: 96 },
    plane: new Bivector(0, 1, 0),
    rate: 1.7,
  },
  {
    name: "torus",
    mesh: Geometry.torus(1.15, 0.42, 28, 16),
    color: { r: 232, g: 116, b: 158 },
    plane: new Bivector(1, 1, 0),
    rate: 1.2,
  },
  {
    name: "bar",
    mesh: Geometry.box(3.2, 0.7, 0.7),
    color: { r: 132, g: 222, b: 132 },
    plane: new Bivector(0, 1, 1),
    rate: 2.1,
  },
];

const satellites = satelliteDefs.map((def, i) => {
  const angle = (i / satelliteDefs.length) * Math.PI * 2;
  const obj = new Object3D({
    name: def.name,
    mesh: def.mesh,
    material: { color: def.color },
    position: new Vec3(Math.cos(angle) * RING, 0, Math.sin(angle) * RING),
  });
  obj.spin = { plane: def.plane, rate: def.rate };
  orbitNode.add(obj);
  return obj;
});

// --- A moon: child of a satellite (three levels deep) -------------------
const moon = new Object3D({
  name: "moon",
  mesh: Geometry.octahedron(0.55),
  material: { color: { r: 226, g: 230, b: 240 } },
  position: new Vec3(2.6, 0, 0),
});
moon.spin = { plane: new Bivector(1, 0, 1), rate: 3.0 };
satellites[0].add(moon);

// --- Camera rig ---------------------------------------------------------
const camControl = {
  target: new Vec3(0, 0.4, 0),
  distance: 18,
  azimuth: 0.6,
  elevation: 0.42,
  autoOrbit: true,
};

// --- Engine -------------------------------------------------------------
const engine = new Engine(canvas, { scene, fog: true });

engine.onUpdate((dt) => {
  // Central knot: spin within its bivector plane.
  knot.rotateLocal(Rotor.fromPlaneAngle(knotPlane, 0.6 * dt));

  // Orbit all satellites by turning the single shared parent node.
  orbitNode.rotateLocal(Rotor.fromAxisAngle(Vec3.e2(), 0.32 * dt));

  // Each satellite (and the moon) spins in its own plane of rotation.
  for (const sat of satellites) {
    sat.rotateLocal(Rotor.fromPlaneAngle(sat.spin.plane, sat.spin.rate * dt));
  }
  moon.rotateLocal(Rotor.fromPlaneAngle(moon.spin.plane, moon.spin.rate * dt));

  if (camControl.autoOrbit) camControl.azimuth += 0.12 * dt;
  camera.orbit(
    camControl.target,
    camControl.distance,
    camControl.azimuth,
    camControl.elevation,
  );

  updateHud();
});

// --- HUD ----------------------------------------------------------------
const hud = {
  fps: document.getElementById("hud-fps"),
  faces: document.getElementById("hud-faces"),
  a: document.getElementById("hud-a"),
  b23: document.getElementById("hud-b23"),
  b31: document.getElementById("hud-b31"),
  b12: document.getElementById("hud-b12"),
  angle: document.getElementById("hud-angle"),
  axis: document.getElementById("hud-axis"),
};

const sign = (n) => (n >= 0 ? "+" : "−") + Math.abs(n).toFixed(4);

function updateHud() {
  const r = knot.orientation;
  hud.fps.textContent = engine.fps.toFixed(0);
  hud.faces.textContent = engine.renderer.stats.drawn;
  hud.a.textContent = sign(r.a);
  hud.b23.textContent = sign(r.b23);
  hud.b31.textContent = sign(r.b31);
  hud.b12.textContent = sign(r.b12);
  hud.angle.textContent = ((r.angle() * 180) / Math.PI).toFixed(1) + "°";
  const ax = r.axis();
  hud.axis.textContent = `(${ax.x.toFixed(2)}, ${ax.y.toFixed(2)}, ${ax.z.toFixed(2)})`;
}

// --- Collapsible HUD (collapsed by default on small screens) ------------
const hudPanel = document.getElementById("hud");
const hudToggle = document.getElementById("hud-toggle");
const compactScreen = window.matchMedia("(max-width: 720px)");
if (compactScreen.matches) hudPanel.classList.add("hud--collapsed");
hudToggle.addEventListener("click", () => {
  const collapsed = hudPanel.classList.toggle("hud--collapsed");
  hudToggle.setAttribute("aria-expanded", String(!collapsed));
});

// --- Controls -----------------------------------------------------------
const btnPause = document.getElementById("btn-pause");
const btnWire = document.getElementById("btn-wireframe");
const btnFog = document.getElementById("btn-fog");
const btnOrbit = document.getElementById("btn-orbit");

btnPause.addEventListener("click", () => {
  engine.toggle();
  btnPause.textContent = engine.running ? "Pause" : "Play";
  btnPause.classList.toggle("off", !engine.running);
});

btnWire.addEventListener("click", () => {
  engine.renderer.mode =
    engine.renderer.mode === "wireframe" ? "solid" : "wireframe";
  const on = engine.renderer.mode === "wireframe";
  btnWire.classList.toggle("active", on);
  if (!engine.running) engine.step(0);
});

btnFog.addEventListener("click", () => {
  engine.renderer.fog = !engine.renderer.fog;
  btnFog.classList.toggle("off", !engine.renderer.fog);
  if (!engine.running) engine.step(0);
});

btnOrbit.addEventListener("click", () => {
  camControl.autoOrbit = !camControl.autoOrbit;
  btnOrbit.classList.toggle("off", !camControl.autoOrbit);
});

// --- Pointer + wheel camera control -------------------------------------
let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  camControl.autoOrbit = false;
  btnOrbit.classList.add("off");
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  camControl.azimuth -= (e.clientX - lastX) * 0.01;
  camControl.elevation -= (e.clientY - lastY) * 0.01;
  camControl.elevation = Math.max(-1.4, Math.min(1.4, camControl.elevation));
  lastX = e.clientX;
  lastY = e.clientY;
  if (!engine.running) engine.step(0);
});

canvas.addEventListener("pointerup", () => {
  dragging = false;
});

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    camControl.distance *= e.deltaY > 0 ? 1.1 : 0.9;
    camControl.distance = Math.max(7, Math.min(48, camControl.distance));
    if (!engine.running) engine.step(0);
  },
  { passive: false },
);

engine.start();
