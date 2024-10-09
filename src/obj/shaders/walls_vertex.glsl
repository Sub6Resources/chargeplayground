#version 300 es
precision mediump float;

in vec3 position;
in vec3 normal;

out vec3 lighting;

layout (std140) uniform Matrices {
    mat4 uWorldMatrix;
    mat4 uViewMatrix;
    mat4 uProjectionMatrix;
    mat4 uNormalMatrix;
};

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(position, 1.0);

    // Apply lighting effect
    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 directionalLightColor = vec3(1, 1, 1);
    vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    vec4 transformedNormal = uNormalMatrix * vec4(normal, 1.0);

    float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    lighting = ambientLight + (directionalLightColor * directional);
}