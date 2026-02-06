/**
 * Base Vertex Shader - Simple passthrough
 * 
 * All warping is now done as UV distortion in the fragment shader.
 * This keeps the mesh flat and avoids muddy depth-based shading.
 */

export const baseVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

