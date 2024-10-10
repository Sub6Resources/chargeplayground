#version 300 es
precision mediump float;

in vec2 quad;

out vec2 index;

void main() {
    index = (quad + 1.0) / 2.0;
    gl_Position = vec4(quad, 0, 1);
}