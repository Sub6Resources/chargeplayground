#version 300 es
precision mediump float;

in uint index;

layout (std140) uniform Matrices {
    mat4 uWorldMatrix;
    mat4 uViewMatrix;
    mat4 uProjectionMatrix;
    mat4 uNormalMatrix;
};
uniform sampler2D memory;
uniform uint memoryWidth;

// Decode vec4 as a 32-bit float
float decodeFloatRGBA(vec4 color) {
    int redInt = int(color.r * 255.0);
    int greenInt = int(color.g * 255.0);
    int blueInt = int(color.b * 255.0);
    int alphaInt = int(color.a * 255.0);
    int signBit = (redInt & 0x80) >> 7;
    int exponent = ((redInt & 0x7f) << 1) | (greenInt >> 7);
    int mantissa = ((greenInt & 0x7f) << 16) | (blueInt << 8) | alphaInt;

    highp float result = 0.0;
    if(exponent == 0) {
        result = pow(-1.0, float(signBit)) * pow(2.0, -126.0) * float(mantissa) / pow(2.0, 23.0);
    } else if(exponent == 255) {
//        result = (mantissa == 0) ? pow(-1.0, float(signBit)) * INFINITY : NAN;
    } else {
        result = pow(-1.0, float(signBit)) * pow(2.0, float(exponent)-127.0) * (1.0 + float(mantissa) / pow(2.0, 23.0));
    }

    if (signBit == 1) {
        result = -result;
    }

    return result;
}

void main() {
    uint true_index = 6u * index;
    vec4 x = texture(memory, vec2((float(true_index % 16u)+0.5)/16.0, (float(true_index / 16u)+0.5)/16.0));
    vec4 y = texture(memory, vec2((float((1u+true_index) % 16u)+0.5)/16.0, (float((1u+true_index) / 16u)+0.5)/16.0));
    vec4 z = texture(memory, vec2((float((2u+true_index) % 16u)+0.5)/16.0, (float((2u+true_index) / 16u)+0.5)/16.0));
    vec4 dx = texture(memory, vec2((float((3u+true_index) % 16u)+0.5)/16.0, (float((3u+true_index) / 16u)+0.5)/16.0));
    vec4 dy = texture(memory, vec2((float((4u+true_index) % 16u)+0.5)/16.0, (float((4u+true_index) / 16u)+0.5)/16.0));
    vec4 dz = texture(memory, vec2((float((5u+true_index) % 16u)+0.5)/16.0, (float((5u+true_index) / 16u)+0.5)/16.0));

    float xFloat = decodeFloatRGBA(x);
    float yFloat = decodeFloatRGBA(y);
    float zFloat = decodeFloatRGBA(z);

    float temp = float(true_index%memoryWidth);
    float temp2 = float(true_index/memoryWidth);
    gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(vec3(xFloat, yFloat, zFloat), 1.0);
    gl_PointSize = 10.0;
}