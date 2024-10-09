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

class Scene {
    sceneObjects = [];

    constructor() {
        this.sceneObjects = [];
    }

    async compile(gl) {
        for (const so of this.sceneObjects) {
            await so.compile(gl);
        }
    }

    add(sceneObject) {
        this.sceneObjects.push(sceneObject);
    }

    remove(gameObject) {
        this.sceneObjects = this.sceneObjects.filter(go => go !== gameObject);
    }

    render(gl, time) {
        this.sceneObjects.forEach(so => so.render(gl, time));
    }
}