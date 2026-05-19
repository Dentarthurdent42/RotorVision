/**
 * RotorVision — a 3D graphics engine that rotates with geometric-algebra
 * rotors instead of quaternions.
 *
 * This barrel re-exports the whole public API. The geometric-algebra core
 * (Vec3, Bivector, Rotor) and the scene types have no DOM dependencies and run
 * anywhere; only Renderer and Engine need a browser canvas.
 */
export { Vec3 } from "./math/vec3.js";
export { Mat4 } from "./math/mat4.js";
export { Bivector } from "./ga/bivector.js";
export { Rotor } from "./ga/rotor.js";

export { Mesh } from "./engine/mesh.js";
export { Geometry } from "./engine/geometry.js";
export { Object3D } from "./engine/object3d.js";
export { Camera } from "./engine/camera.js";
export { Scene } from "./engine/scene.js";
export { Renderer } from "./engine/renderer.js";
export { Engine } from "./engine/engine.js";
