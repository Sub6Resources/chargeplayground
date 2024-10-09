#version 300 es
precision mediump float;

in vec3 position;  // Charge position
in vec3 velocity;  // Charge velocity
in float charge;   // Charge charge
in float mass;     // Charge mass

uniform float uTime;  // Time for simulation

layout (std140) uniform Matrices {
    mat4 uWorldMatrix;
    mat4 uViewMatrix;
    mat4 uProjectionMatrix;
    mat4 uNormalMatrix;
};

out vec4 vColor;  // Pass charge color to fragment shader

void main(void) {
    // Ensure aPosition is used to calculate gl_Position
    vec3 init_pos = vec3(position.xyz);
    init_pos += velocity * uTime;

    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(init_pos, 1.0);
    gl_PointSize = 5.0 + mass;

    // Pass the color to the fragment shader
    vColor = vec4((1.0 + charge)/2.0, 0.0, (-1.0 + charge)/-2.0, 1.0);
}