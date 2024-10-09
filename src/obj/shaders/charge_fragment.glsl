#version 300 es
precision mediump float;

in vec4 vColor;
out vec4 fragColor;

void main(void) {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) {
        discard;
    }

    fragColor = vColor;
}