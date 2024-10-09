#version 300 es
precision mediump float;

in vec3 lighting;

out vec4 fragColor;

void main() {
    vec4 color = vec4(0.4, 0.4, 0.4, 1.0);
    fragColor = vec4(color.rgb * lighting, color.a);
}