class Charge extends SceneObject {
    constructor(gl, init_pos, init_vel, charge, mass) {
        super(gl,
            "src/obj/shaders/charge_vertex.glsl",
            "src/obj/shaders/charge_fragment.glsl"
        );
        this.data = new Float32Array(8);
        const offset = 0;
        this.data[offset] = init_pos[0];  // X position
        this.data[offset + 1] = init_pos[1];  // Y position
        this.data[offset + 2] = init_pos[2];  // Z position
        this.data[offset + 3] = init_vel[0];  // X Velocity
        this.data[offset + 4] = init_vel[1];  // Y Velocity
        this.data[offset + 5] = init_vel[2];  // Z Velocity
        this.data[offset + 6] = charge;  // Charge
        this.data[offset + 7] = mass;  // Mass

        this.startTime = null;
    }

    async compile(gl) {
        await super.compile(gl);
        gl.useProgram(this.program);

        this.uTimeLocation = gl.getUniformLocation(this.program, 'uTime');

        // Set up attributes
        this.vertexCount = this.data.length / 8;
        this.chargeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);

        this.attrLocPosition = gl.getAttribLocation(this.program, 'position');
        this.attrLocVelocity = gl.getAttribLocation(this.program, 'velocity');
        this.attrLocCharge = gl.getAttribLocation(this.program, 'charge');
        this.attrLocMass = gl.getAttribLocation(this.program, 'mass');
    }

    render(gl, time) {
        if(this.startTime === null) {
            this.startTime = time;
        }
        super.render(gl, time - this.startTime);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.chargeBuffer);

        gl.vertexAttribPointer(this.attrLocPosition, 3, gl.FLOAT, false, 8 * 4, 0);
        gl.enableVertexAttribArray(this.attrLocPosition);
        gl.vertexAttribPointer(this.attrLocVelocity, 3, gl.FLOAT, false, 8 * 4, 3 * 4);
        gl.enableVertexAttribArray(this.attrLocVelocity);
        gl.vertexAttribPointer(this.attrLocCharge, 1, gl.FLOAT, false, 8 * 4, 6 * 4);
        gl.enableVertexAttribArray(this.attrLocCharge);
        gl.vertexAttribPointer(this.attrLocMass, 1, gl.FLOAT, false, 8 * 4, 7 * 4);
        gl.enableVertexAttribArray(this.attrLocMass);


        // Update the time uniform
        gl.uniform1f(this.uTimeLocation, (time - this.startTime)*0.001);
        document.getElementById("pos").textContent = ((time - this.startTime)*0.001).toFixed(3);

        // Draw stars using point rendering
        gl.drawArrays(gl.POINTS, 0, this.vertexCount);
    }
}