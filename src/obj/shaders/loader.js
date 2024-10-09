let shaderCache = {};

async function getShaderProgram(gl, vertexShaderPath, fragmentShaderPath) {
    if(shaderCache[vertexShaderPath + fragmentShaderPath]) {
        return shaderCache[vertexShaderPath + fragmentShaderPath];
    }

    const vertexShader = await _getShaderSource(vertexShaderPath);
    const fragmentShader = await _getShaderSource(fragmentShaderPath);
    const program = _createShaderProgram(gl, vertexShader, fragmentShader);
    if(!program) {
        console.error('Failed to initialize shaders for ' + vertexShaderPath + ' and ' + fragmentShaderPath);
        return null;
    }

    shaderCache[vertexShaderPath + fragmentShaderPath] = program;
    return program;
}

// Utility function to load shader source
function _getShaderSource(path) {
    return fetch(path).then(response => response.text()).then(text => text.trim());
}

// Create and compile a shader
function _compileShader(gl, shaderSource, shaderType) {
    const shader = gl.createShader(shaderType);    // Create shader object
    gl.shaderSource(shader, shaderSource);         // Set source code
    gl.compileShader(shader);                      // Compile shader

    // Check for compilation errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Link shaders into a program
function _createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = _compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = _compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Check for linking errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error: ', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}