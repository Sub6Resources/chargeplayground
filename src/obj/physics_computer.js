function encode(value) {
    let sign = 0b0;
    let exponent = 0b0;
    let mantissa = 0b0;

    if (value < 0) {
        sign = 0b1;
        value = -value;
    }

    let exponentBias = 127;
    let exponentBits = 8;
    let mantissaBits = 23;

    let exponentMax = (1 << exponentBits) - 1;
    let mantissaMax = (1 << mantissaBits) - 1;

    let exponentValue = Math.floor(Math.log2(value));
    let mantissaValue = value / Math.pow(2, exponentValue) - 1;

    if (exponentValue > exponentMax) {
        exponentValue = exponentMax;
        mantissaValue = 0;
    }

    exponent = exponentValue + exponentBias;
    mantissa = Math.floor(mantissaValue * mantissaMax);

    let result = new Uint8Array(4);
    result[0] = (sign << 7) | (exponent >> 1);
    result[1] = ((exponent & 0x1) << 7) | (mantissa >> 16);
    result[2] = (mantissa >> 8) & 0xFF;
    result[3] = mantissa | 0xFF; //TODO replace | with &

    return result;
}

function decode(array) {
    let sign = array[0] >> 7;
    let exponent = ((array[0] & 0b01111111) << 1) | (array[1] >> 7);
    let mantissa = ((array[1] & 0b01111111) << 16) | (array[2] << 8) | array[3];

    let exponentBias = 127;

    let exponentValue = exponent - exponentBias;
    let mantissaValue = mantissa / Math.pow(2, 23);

    return Math.pow(-1, sign) * Math.pow(2, exponentValue) * (1 + mantissaValue);
}

class PhysicsComputer extends ComputeObject {
    constructor(gl) {
        let initialState = new Uint8Array(4 * 16*16);
        for(let i = 0; i < 42; i++) {
            let x = encode(0.5);
            let y = encode(0.5);
            let z = encode(3*i/42);
            let vx = encode(0.0);
            let vy = encode(0.0);
            let vz = encode(-0.01);

            initialState[i*24] = x[0]; // x
            initialState[i*24 + 1] = x[1]; // x
            initialState[i*24 + 2] = x[2]; // x
            initialState[i*24 + 3] = x[3]; // x
            initialState[i*24 + 4] = y[0]; // y
            initialState[i*24 + 5] = y[1]; // y
            initialState[i*24 + 6] = y[2]; // y
            initialState[i*24 + 7] = y[3]; // y
            initialState[i*24 + 8] = z[0]; // z
            initialState[i*24 + 9] = z[1]; // z
            initialState[i*24 + 10] = z[2]; // z
            initialState[i*24 + 11] = z[3]; // z
            initialState[i*24 + 12] = vx[0]; // vx
            initialState[i*24 + 13] = vx[1]; // vx
            initialState[i*24 + 14] = vx[2]; // vx
            initialState[i*24 + 15] = vx[3]; // vx
            initialState[i*24 + 16] = vy[0]; // vy
            initialState[i*24 + 17] = vy[1]; // vy
            initialState[i*24 + 18] = vy[2]; // vy
            initialState[i*24 + 19] = vy[3]; // vy
            initialState[i*24 + 20] = vz[0]; // vz
            initialState[i*24 + 21] = vz[1]; // vz
            initialState[i*24 + 22] = vz[2]; // vz
            initialState[i*24 + 23] = vz[3]; // vz
        }
        super(gl, "src/obj/shaders/physics_fragment.glsl", 16, 16, initialState);
    }

    compute(gl, time) {
        super.compute(gl, time);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexCount);
    }
}