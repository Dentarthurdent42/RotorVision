# RotorVision

A small 3D graphics engine that rotates with **geometric-algebra rotors**
instead of quaternions.

Everything that turns in RotorVision — meshes, the scene-graph hierarchy, the
camera rig, even the swept geometry of the torus knot — is rotated by a rotor
through the sandwich product **v′ = R v R~**. There is not a single quaternion
or rotation matrix in the transform path.

## Why rotors?

A **rotor** is an even-grade element of the 3D geometric algebra G3 — a scalar
plus a bivector:

```
R = a + b23·e23 + b31·e31 + b12·e12
```

It carries the same four numbers as a unit quaternion and costs exactly the
same to evaluate, but it is built from honest geometric objects rather than
abstract symbols:

| Quaternion | Rotor |
| --- | --- |
| `i, j, k` are abstract units *asserted* to square to -1 | `e23, e31, e12` are oriented **planes**; squaring to -1 is *derived* from the geometric product |
| Rotates by embedding a vector as a "pure quaternion" in 4D | Rotates a vector that lives in the *same algebra* — no embedding |
| A rotation is "about an axis" (a 3D-only accident) | A rotation is "in a plane" — the picture works in any dimension |
| `q v q*` | `R v R~` |

A rotor is constructed by exponentiating a bivector, and composing rotations is
just multiplying rotors. See `src/ga/rotor.js` for the fully commented
implementation, including the expanded sandwich product.

## Running the demo

The demo is a set of native ES modules, so it needs to be served over HTTP:

```bash
npm start          # serves the folder at http://localhost:8000
```

Then open <http://localhost:8000>. You will see a rotor-spun torus knot, five
satellites orbiting a shared parent node, and a moon nested one level deeper —
the whole hierarchy resolved with rotor multiplication. Drag to orbit the
camera, scroll to zoom, and watch the HUD report the knot's live rotor.

## Running the tests

The geometric-algebra core has no browser dependencies and is covered by a
suite that runs on Node's built-in test runner:

```bash
npm test
```

It checks the rotor algebra (sandwich product, composition, `exp`/`log`, slerp,
the double cover), mesh winding, the scene-graph transforms, and the renderer
pipeline through a headless mock canvas.

## How it works

```
src/
  math/
    vec3.js        Grade-1 vectors — the things rotors act on
    mat4.js        4×4 matrix, only for perspective + WebGL interop
  ga/
    bivector.js    Grade-2 oriented planes; the wedge product
    rotor.js       The rotation primitive: sandwich product, exp/log, slerp
  engine/
    geometry.js    Procedural meshes (the torus knot sweeps its tube with rotors)
    mesh.js        Raw vertex/face/line data
    object3d.js    Scene-graph node with a (position, rotor, scale) transform
    camera.js      A position + a rotor; the view transform is the reverse rotor
    scene.js       Root node, camera and light
    renderer.js    Software rasteriser on a 2D canvas (painter's algorithm)
    engine.js      The requestAnimationFrame run loop
  index.js         Barrel re-export of the public API
  demo.js          The showcase scene
```

The pipeline is deliberately matrix-free apart from the final perspective
divide: vertices are placed in the world by rotors (`Object3D`), carried into
camera space by the camera's reverse rotor (`Camera`), and only then projected.

## API sketch

```js
import { Rotor, Vec3, Bivector } from "./src/index.js";

// Rotate a vector 90° in the e1^e2 plane.
const R = Rotor.fromPlaneAngle(new Bivector(0, 0, 1), Math.PI / 2);
R.rotate(new Vec3(1, 0, 0));            // → Vec3(0, 1, 0)

// The shortest rotation taking one direction onto another — no trig, no axis.
Rotor.fromTo(Vec3.e1(), Vec3.e3());

// Compose rotations by multiplying; interpolate them by slerp.
const A = Rotor.fromAxisAngle(Vec3.e2(), 0.5);
const B = Rotor.fromAxisAngle(Vec3.e1(), 1.2);
A.mul(B);                                // apply B, then A
A.slerp(B, 0.5);                         // halfway between the two

// Hand the rotation to a matrix-based pipeline (e.g. WebGL) when you need to.
Rotor.fromAxisAngle(Vec3.e2(), 1.0).toMatrix3();
```

## License

MIT
