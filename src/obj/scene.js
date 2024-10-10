class SceneObject {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;
    }

    async compile(gl) {
        this.program = await getShaderProgram(gl, this.vertexShaderSource, this.fragmentShaderSource);
        if(!this.program) {
            console.error(`Failed to initialize shaders for ${this.constructor.name}.`);
        }
    }

    render(gl, time) {
        gl.useProgram(this.program);
    }
}

const QUAD2 = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);


class ComputeObject {
    constructor(gl, computeShaderSource, memoryWidth, memoryHeight, initialMemory) {
        this.quadShaderSource = "src/obj/shaders/quad_vertex.glsl";
        this.computeShaderSource = computeShaderSource;

        this.readMemoryTexture = gl.createTexture();
        this.writeMemoryTexture = gl.createTexture();
        this.frameBuffer = gl.createFramebuffer();
        this.memoryWidth = memoryWidth;
        this.memoryHeight = memoryHeight;
        gl.bindTexture(gl.TEXTURE_2D, this.writeMemoryTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.memoryWidth, this.memoryHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialMemory);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, this.readMemoryTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.memoryWidth, this.memoryHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, initialMemory);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    async compile(gl) {
        this.program = await getShaderProgram(gl, this.quadShaderSource, this.computeShaderSource);
        if(!this.program) {
            console.error(`Failed to initialize compute shaders for ${this.constructor.name}.`);
        }

        gl.useProgram(this.program);

        this.vertexCount = QUAD2.length / 2;

        this.quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, QUAD2, gl.STATIC_DRAW);
        this.attrLocQuad = gl.getAttribLocation(this.program, 'quad');
    }

    compute(gl, time) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.writeMemoryTexture, 0);
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.readMemoryTexture);
        gl.viewport(0, 0, this.memoryWidth, this.memoryHeight);
        gl.useProgram(this.program);

        // Vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
        gl.vertexAttribPointer(this.attrLocQuad, 2, gl.FLOAT, false, 2*4, 0);
        gl.enableVertexAttribArray(this.attrLocQuad);
    }

    save() {
        const temp = this.readMemoryTexture;
        this.readMemoryTexture = this.writeMemoryTexture;
        this.writeMemoryTexture = temp;
    }
}

class Scene {
    computeObjects = [];
    sceneObjects = [];

    constructor() {
        this.computeObjects = [];
        this.sceneObjects = [];
    }

    async compile(gl) {
        for (const co of this.computeObjects) {
            await co.compile(gl);
        }

        for (const so of this.sceneObjects) {
            await so.compile(gl);
        }
    }

    addCompute(computeObject) {
        this.computeObjects.push(computeObject);
    }

    add(sceneObject) {
        this.sceneObjects.push(sceneObject);
    }

    render(gl, time, width, height) {
        this.computeObjects.forEach(co => {
            co.compute(gl, time);
            co.save();
        });

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.viewport(0, 0, width, height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Clear the screen (color and depth buffer)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Attach memory textures
        for (let i = 0; i < this.computeObjects.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, this.computeObjects[i].readMemoryTexture);
        }
        this.sceneObjects.forEach(so => so.render(gl, time));
    }
}