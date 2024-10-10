class ChargeStream extends SceneObject {
    constructor(gl) {
        super(gl, "src/obj/shaders/particles_vertex.glsl", "src/obj/shaders/particles_fragment.glsl");
    }

    async compile(gl) {
        await super.compile(gl);
        gl.useProgram(this.program);
        this.unifLocMemoryWidth = gl.getUniformLocation(this.program, 'memoryWidth');
        this.chargeIndices = new Uint32Array(42);
        for (let i = 0; i < this.chargeIndices.length; i++) {
            this.chargeIndices[i] = i;
        }
        this.chargeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.chargeIndices, gl.STATIC_DRAW);
        this.particleCount = this.chargeIndices.length;
        this.attrLocIndex = gl.getAttribLocation(this.program, 'index');
    }

    render(gl, time) {
        super.render(gl, time);
        gl.uniform1ui(this.unifLocMemoryWidth, 16);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer);
        gl.vertexAttribIPointer(this.attrLocIndex, 1, gl.UNSIGNED_INT, 0, 0);
        gl.enableVertexAttribArray(this.attrLocIndex);
        gl.drawArrays(gl.POINTS, 0, this.particleCount);
    }
}