const fovy = Math.PI/4;
const near_culling = 0.0;
const far_culling = 100.0;

let paused = false;

async function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        throw new Error('WebGL 2.0 is not supported in this browser.');
    }

    // Vertex shader texture access not guaranteed on OpenGL ES 2.0
    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) === 0) {
        const msg = 'Required graphics feature not available. Try again on another platform.';
        alert(msg);
        throw new Error(msg);
    }

    // Initialize uniform buffer for transformation matrices
    const ubMatrices = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, ubMatrices);
    gl.bufferData(gl.UNIFORM_BUFFER, 4 * 16 * 4, gl.STATIC_DRAW);  // 4 matrices, 16 floats per matrix, 4 bytes per float
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ubMatrices);

    // Initialize Matrices
    const worldMatrix = glMatrix.mat4.create();
    const viewMatrix = glMatrix.mat4.create();
    const projectionMatrix = glMatrix.mat4.create();
    const normalMatrix = glMatrix.mat4.create(); // For lighting

    // Set the view matrix (camera position)
    const camera = new Camera();
    camera.setPosition(3.0, 2.5, 4.0);
    camera.setForward(-1.0, -1.0, -1.0);
    camera.setUp(0.0, 1.0, 0.0);
    camera.getViewMatrix(viewMatrix);

    // Set the projection matrix (perspective)
    glMatrix.mat4.perspective(projectionMatrix, fovy, canvas.width / canvas.height, near_culling, far_culling);
    glMatrix.mat4.invert(normalMatrix, viewMatrix * worldMatrix);
    glMatrix.mat4.transpose(normalMatrix, normalMatrix);

    // Update uniform buffer with the matrices
    function updateMatrices() {
        camera.getViewMatrix(viewMatrix);
        glMatrix.mat4.invert(normalMatrix, viewMatrix * worldMatrix);
        glMatrix.mat4.transpose(normalMatrix, normalMatrix);

        gl.bindBuffer(gl.UNIFORM_BUFFER, ubMatrices);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 0, worldMatrix);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 16 * 4, viewMatrix);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 2 * 16 * 4, projectionMatrix);
        gl.bufferSubData(gl.UNIFORM_BUFFER, 3 * 16 * 4, normalMatrix);
    }

    let scene = new Scene(gl);
    const physics = new PhysicsComputer(gl);
    scene.addCompute(physics);
    scene.add(new Walls(gl));
    scene.add(new ChargeStream(gl));
    await scene.compile(gl);

    // Rendering loop
    let lastTime = 0;
    let fpsStack = [];
    let fpsIndicator = document.getElementById('fps');
    function render(time) {
        const deltaTime = (time - lastTime) / 1000.0;
        fpsStack.push(1.0 / deltaTime);
        if (fpsStack.length > 10) {
            fpsStack.shift();
            fpsIndicator.textContent = (fpsStack.reduce((a, b) => a + b, 0) / fpsStack.length).toFixed(0) + ' fps';
        }

        lastTime = time;

        updateMatrices();

        // Render the scene
        scene.render(gl, time, canvas.width, canvas.height);

        if(!paused) {
            requestAnimationFrame(render);
        }
    }

    requestAnimationFrame(render);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        glMatrix.mat4.perspective(projectionMatrix, fovy, canvas.width / canvas.height, near_culling, far_culling);
        updateMatrices();
    }

    window.addEventListener('resize', resizeCanvas, false);

    window.addEventListener('keydown', function(event) {
        // Translation
        switch (event.key) {
            case 'ArrowUp':
                camera.moveForward(0.01);
                break;
            case 'ArrowDown':
                camera.moveForward(-0.01);
                break;
            case 'ArrowLeft':
                camera.moveLeft(0.01);
                break;
            case 'ArrowRight':
                camera.moveLeft(-0.01);
                break;
        }
        // Rotation
        switch (event.key) {
            case 'w':
                camera.pitchUp(-0.01);
                break;
            case 's':
                camera.pitchUp(0.01)
                break;
            case 'a':
                camera.yawLeft(0.01);
                break;
            case 'd':
                camera.yawLeft(-0.01);
                break;
            case 'q':
                camera.rollLeft(0.01);
                break;
            case 'e':
                camera.rollLeft(-0.01);
                break;
        }
        updateMatrices();
    });

    const Ex_input = document.getElementById("ex");
    const Ey_input = document.getElementById("ey");
    const Ez_input = document.getElementById("ez");
    const Bx_input = document.getElementById("bx");
    const By_input = document.getElementById("by");
    const Bz_input = document.getElementById("bz");
    const Q_input = document.getElementById("q");
    const M_input = document.getElementById("m");
    const vz_input = document.getElementById("vz");
    const reset = document.getElementById("reset");
    const resetParams = document.getElementById("reset2");
    const pause_button = document.getElementById("pause");

    Ex_input.value = physics.Ex;
    Ey_input.value = physics.Ey;
    Ez_input.value = physics.Ez;
    Bx_input.value = physics.Bx;
    By_input.value = physics.By;
    Bz_input.value = physics.Bz;
    Q_input.value = physics.Q;
    M_input.value = physics.M;
    vz_input.value = physics.v_0;

    let update = function() {
        physics.Ex = parseFloat(Ex_input.value);
        physics.Ey = parseFloat(Ey_input.value);
        physics.Ez = parseFloat(Ez_input.value);
        physics.Bx = parseFloat(Bx_input.value);
        physics.By = parseFloat(By_input.value);
        physics.Bz = parseFloat(Bz_input.value);
        physics.Q = parseFloat(Q_input.value);
        physics.M = parseFloat(M_input.value);
        physics.v_0 = parseFloat(vz_input.value);
    }

    Ex_input.onchange = update;
    Ey_input.onchange = update;
    Ez_input.onchange = update;
    Bx_input.onchange = update;
    By_input.onchange = update;
    Bz_input.onchange = update;
    Q_input.onchange = update;
    M_input.onchange = update;
    vz_input.onchange = update;

    reset.onclick = function() {
        physics.resetParticles(gl);
        if (paused) {
            requestAnimationFrame(render);
        }
    }

    resetParams.onclick = function() {
        Ex_input.value = 0;
        Ey_input.value = 0;
        Ez_input.value = 0;
        Bx_input.value = -1;
        By_input.value = 0;
        Bz_input.value = 0;
        Q_input.value = 1;
        M_input.value = 1;
        vz_input.value = -0.01;
        physics.resetParticles(gl);
        update();
        if (paused) {
            requestAnimationFrame(render);
        }
    }

    pause_button.onclick = function() {
        paused = !paused;
        if(!paused) {
            requestAnimationFrame(render);
        }
        pause_button.innerText = paused ? "Resume": "Pause";
    }

    return canvas;
}

initWebGL()
    .then(canvas => canvas.classList.add("loaded"))
    .catch(error => console.error(error));