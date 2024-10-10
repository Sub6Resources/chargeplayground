#version 300 es
precision mediump float;

in vec2 index;

uniform sampler2D memory;
uniform vec3 Efield;
uniform vec3 Bfield;
uniform float Q;
uniform float M;
uniform float v_0;

out vec4 fragColor;

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
        result = pow(2.0, -126.0) * float(mantissa) / pow(2.0, 23.0);
    } else if(exponent == 255) {
        //        result = (mantissa == 0) ? pow(-1.0, float(signBit)) * INFINITY : NAN;
    } else {
        result = pow(2.0, float(exponent)-127.0) * (1.0 + float(mantissa) / pow(2.0, 23.0));
    }

    if(signBit == 1) {
        result = -result;
    }

    return result;
}

vec4 encodeFloat(float value) {
    int sign = 0x0;
    int exponent = 0x0;
    int mantissa = 0x0;

    if (value < 0.0) {
        sign = 0x1;
        value = -value;
    }

    const int exponentBias = 127;
    const int exponentBits = 8;
    const int mantissaBits = 23;

    int exponentMax = (1 << exponentBits) - 1;
    int mantissaMax = (1 << mantissaBits) - 1;

    int exponentValue = int(floor(log2(value)));
    float mantissaValue = float(value / pow(2.0, float(exponentValue)) - 1.0);

    if (exponentValue > exponentMax) {
        exponentValue = exponentMax;
        mantissaValue = 0.0;
    }

    exponent = exponentValue + exponentBias;
    mantissa = int(floor(mantissaValue * float(mantissaMax)));

    vec4 result = vec4(0.0, 0.0, 0.0, 0.0);
    result.r = float((sign << 7) | (exponent >> 1)) / 255.0;
    result.g = float(((exponent & 0x1) << 7) | (mantissa >> 16)) / 255.0;
    result.b = float((mantissa >> 8) & 0xFF) / 255.0;
    result.a = float(mantissa | 0xFF)/255.0;

    return result;
}

void main() {
    vec2 scaled_index = index * 16.0;
    uint true_index_x = uint(floor(scaled_index.x));
    uint true_index_y = uint(floor(scaled_index.y));
    uint total_index = true_index_x + 16u*true_index_y;
    vec4 memorySample = texture(memory, index);


    uint offset = total_index % 6u;
    uint start_index = total_index - offset;

    vec4 curr_x = texture(memory, vec2((float(start_index % 16u)+0.5)/16.0, (float(start_index / 16u)+0.5)/16.0));
    vec4 curr_y = texture(memory, vec2((float((1u+start_index) % 16u)+0.5)/16.0, (float((1u+start_index) / 16u)+0.5)/16.0));
    vec4 curr_z = texture(memory, vec2((float((2u+start_index) % 16u)+0.5)/16.0, (float((2u+start_index) / 16u)+0.5)/16.0));
    vec4 curr_dx = texture(memory, vec2((float((3u+start_index) % 16u)+0.5)/16.0, (float((3u+start_index) / 16u)+0.5)/16.0));
    vec4 curr_dy = texture(memory, vec2((float((4u+start_index) % 16u)+0.5)/16.0, (float((4u+start_index) / 16u)+0.5)/16.0));
    vec4 curr_dz = texture(memory, vec2((float((5u+start_index) % 16u)+0.5)/16.0, (float((5u+start_index) / 16u)+0.5)/16.0));

    float currXFloat = decodeFloatRGBA(curr_x);
    float currYFloat = decodeFloatRGBA(curr_y);
    float currZFloat = decodeFloatRGBA(curr_z);
    float currDXFloat = decodeFloatRGBA(curr_dx);
    float currDYFloat = decodeFloatRGBA(curr_dy);
    float currDZFloat = decodeFloatRGBA(curr_dz);

    highp vec3 v = vec3(currDXFloat, currDYFloat, currDZFloat);
    highp vec3 vxB = cross(v, Bfield);
    highp vec3 acc = (Efield + vxB) * Q / M;

    float newX = currXFloat + currDXFloat;
    float newY = currYFloat + currDYFloat;
    float newZ = currZFloat + currDZFloat;
    if (offset == 0u) {
        if (newX > 2.0 || newX <= 0.0 || newY > 2.0 || newY <= 0.0 || newZ > 4.0 || newZ <= 0.0) {
            memorySample = encodeFloat(0.5);
        } else {
            memorySample = encodeFloat(newX);
        }
    } else if (offset == 1u) {
        if (newX > 2.0 || newX <= 0.0 || newY > 2.0 || newY <= 0.0 || newZ > 4.0 || newZ <= 0.0) {
            memorySample = encodeFloat(0.5);
        } else {
            memorySample = encodeFloat(newY);
        }
    } else if (offset == 2u) {
        if (newX > 2.0 || newX <= 0.0 || newY > 2.0 || newY <= 0.0 || newZ > 4.0 || newZ <= 0.0) {
            newZ = 3.0;
        }
        memorySample = encodeFloat(newZ);
    } else if (offset == 3u) {
        if (newX > 2.0 || newX <= 0.0 || newY > 2.0 || newY <= 0.0 || newZ > 4.0 || newZ <= 0.0) {
            memorySample = encodeFloat(0.0);
        } else {
            memorySample = encodeFloat(currDXFloat + acc.x*1e-3);
        }
    } else if (offset == 4u) {
        if (newX > 2.0 || newX <= 0.0 || newY > 2.0 || newY <= 0.0 || newZ > 4.0 || newZ <= 0.0) {
            memorySample = encodeFloat(0.0);
        } else {
            memorySample = encodeFloat(currDYFloat + acc.y*1e-3);
        }
    } else if (offset == 5u) {
        if (newX > 2.0 || newX <= 0.0 || newY > 2.0 || newY <= 0.0 || newZ > 4.0 || newZ <= 0.0) {
            memorySample = encodeFloat(v_0);
        } else {
            memorySample = encodeFloat(currDZFloat + acc.z*1e-3);
        }
    }

    fragColor = memorySample;
}