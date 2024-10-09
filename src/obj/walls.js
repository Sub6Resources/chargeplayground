class Walls extends SceneObject {
    constructor(gl) {
        super(gl,
            'src/obj/shaders/walls_vertex.glsl',
            'src/obj/shaders/walls_fragment.glsl'
        );
        this.groundVertices = new Float32Array([
            // X,    Y,    Z
            0.0, 0.0, 0.0,
            0.0, 0.0, 3.0,
            1.0, 0.0, 3.0,
            0.0, 0.0, 0.0,
            1.0, 0.0, 3.0,
            1.0, 0.0, 0.0,

            0.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 1.0, 0.0,
            0.0, 0.0, 0.0,
            1.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 3.0,
            0.0, 0.0, 0.0,
            0.0, 1.0, 3.0,
            0.0, 0.0, 3.0
        ]);

        this.normal = new Float32Array([
            // X,    Y,    Z
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0
        ]);

    }

    async compile(gl) {
        await super.compile(gl);
        gl.useProgram(this.program);

        this.vertexCount = this.groundVertices.length / 3;
        this.groundBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.groundBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.groundVertices, gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normal, gl.STATIC_DRAW);

        this.attrLocPosition = gl.getAttribLocation(this.program, 'position');
        this.attrLocNormal = gl.getAttribLocation(this.program, 'normal');
    }

    render(gl, time) {
        super.render(gl, time);

        // Vertices
        gl.bindBuffer(gl.ARRAY_BUFFER, this.groundBuffer);
        gl.vertexAttribPointer(this.attrLocPosition, 3, gl.FLOAT, false, 3*4, 0);
        gl.enableVertexAttribArray(this.attrLocPosition);

        // Normal Vectors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(this.attrLocNormal, 3, gl.FLOAT, false, 3*4, 0);
        gl.enableVertexAttribArray(this.attrLocNormal);

        // Draw Walls
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
}