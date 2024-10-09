const fovy = Math.PI/2.5;
const near_culling = 0.0;
const far_culling = 100.0;


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
    camera.setPosition(2.0, 1.5, 3.0);
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

    // Set GL options
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    let scene = new Scene(gl);
    scene.add(new Walls(gl));
    scene.add(new Charge(gl, new glMatrix.vec3.fromValues(0.0, 0.0, 1.0), new glMatrix.vec3.fromValues(0.0, 0.0, 0.0), 1.0, 0.0));
    scene.add(new Charge(gl, new glMatrix.vec3.fromValues(0.0, 1.0, 0.0), new glMatrix.vec3.fromValues(0.0, 0.0, 0.0), 1.0, 0.0));
    scene.add(new Charge(gl, new glMatrix.vec3.fromValues(1.0, 0.0, 0.5), new glMatrix.vec3.fromValues(0.0, 0.0, 0.0), -1.0, 0.0));
    scene.add(new Charge(gl, new glMatrix.vec3.fromValues(1.0, 1.0, 0.7), new glMatrix.vec3.fromValues(0.0, 0.0, 0.0), 1.0, 0.0));
    scene.add(new Charge(gl, new glMatrix.vec3.fromValues(0.5, 0.7, 1.0), new glMatrix.vec3.fromValues(0.0, 0.0, 0.0), -1.0, 0.0));
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

        // Clear the screen (color and depth buffer)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Render the scene
        scene.render(gl, time);

        requestAnimationFrame(render);
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


    return canvas;
}

initWebGL()
    .then(canvas => canvas.classList.add("loaded"))
    .catch(error => console.error(error));