# RotorVision

A small 3D graphics engine that rotates with **geometric-algebra rotors** instead of quaternions.

Everything that turns in RotorVision — meshes, the scene-graph hierarchy, the camera rig, even the swept geometry of the torus knot — is rotated by a rotor through the sandwich product **v′ = R v R~**. The project is both a graphics demo and an argument that rotors are a clean, intuitive foundation for 3D transforms.

## What it does

RotorVision renders an interactive 3D scene powered by native ES modules and a custom engine. The demo includes:

- a rotor-spun torus knot
- orbiting satellites arranged in a scene graph
- a camera rig driven by rotor-based transforms
- an on-screen HUD showing the live rotor components
- controls for pausing, wireframe mode, fog, and auto-orbit

Instead of relying on quaternions in the transform pipeline, the engine uses **rotors from geometric algebra** as the primary rotation primitive.

## Why rotors?

A **rotor** is an even-grade element of 3D geometric algebra: a scalar plus bivector components. It carries the same amount of information as a unit quaternion, but it is expressed in terms of geometric objects — oriented planes — rather than abstract imaginary units.

That gives the math a particularly satisfying interpretation:

- rotations happen **in a plane**, not just around an axis
- vectors and rotations live in the **same algebraic system**
- composition is just **rotor multiplication**
- rotating a vector uses the sandwich product **R v R~**

RotorVision is a practical experiment in building a graphics pipeline around that viewpoint.

## Features

- **Rotor-based 3D transforms** throughout the engine
- **Interactive canvas demo** with camera orbit and zoom
- **Live rotor HUD** showing scalar and bivector terms
- **Scene graph hierarchy** resolved through rotor composition
- **Procedural geometry** including a torus-knot showcase object
- **Matrix-free transform path** up to final projection / rendering interop
- **Node-based test suite** for the geometric-algebra core and engine behavior

## Project structure

```text
src/
  math/
    vec3.js        vectors
    mat4.js        perspective / interop matrix utilities
  ga/
    bivector.js    oriented planes and wedge-product concepts
    rotor.js       sandwich product, exp/log, slerp, composition
  engine/
    geometry.js    procedural meshes
    mesh.js        mesh data
    object3d.js    transform hierarchy with position, rotor, scale
    camera.js      camera transform via reverse rotor
    scene.js       root scene objects
    renderer.js    rendering pipeline
    engine.js      animation loop
  index.js         public API re-exports
  demo.js          showcase scene
```

## Running the demo

Serve the project locally over HTTP:

```bash
npm start
```

Then open `http://localhost:8000` in your browser.

## Running the tests

The core math and engine pieces are testable outside the browser:

```bash
npm test
```

## Tech stack

- **JavaScript**
- **Native ES modules**
- **HTML Canvas**
- **Custom geometric algebra math**

## Why this project exists

RotorVision is partly a rendering experiment and partly a mathematical one.

The goal is to show that geometric-algebra rotors are not just elegant on paper — they can directly power an interactive graphics engine. It is a way of making abstract math operational, visible, and testable in code.

## Author

Created by **Mathieu Poulin**.

## License

MIT
