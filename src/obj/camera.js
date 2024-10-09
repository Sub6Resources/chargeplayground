const vec3 = glMatrix.vec3;
const mat4 = glMatrix.mat4;

class Camera {
    constructor() {
        this.pos = vec3.create();
        this.up = vec3.create();
        this.center = vec3.create();
        this.forward = vec3.create();
    }

    setPosition(x, y, z) {
        vec3.set(this.pos, x, y, z);
    }

    setForward(x, y, z) {
        vec3.set(this.forward, x, y, z);
        vec3.add(this.center, this.pos, this.forward);
    }

    setUp(x, y, z) {
        vec3.set(this.up, x, y, z);
    }

    setYaw(yaw) {
        let rotationMatrix = mat4.create();
        mat4.rotateY(rotationMatrix, rotationMatrix, yaw);
        vec3.transformMat4(this.forward, this.forward, rotationMatrix);
        vec3.add(this.center, this.pos, this.forward);
    }

    setPitch(pitch) {
        let rotationMatrix = mat4.create();
        mat4.rotateX(rotationMatrix, rotationMatrix, pitch);
        vec3.transformMat4(this.forward, this.forward, rotationMatrix);
        vec3.add(this.center, this.pos, this.forward);
    }

    setRoll(roll) {
        let rotationMatrix = mat4.create();
        mat4.rotateZ(rotationMatrix, rotationMatrix, roll);
        vec3.transformMat4(this.forward, this.forward, rotationMatrix);
        vec3.add(this.center, this.pos, this.forward);
    }

    moveForward(distance) {
        let movement = vec3.create();
        vec3.scale(movement, this.forward, distance);
        vec3.add(this.pos, this.pos, movement);
        vec3.add(this.center, this.pos, this.forward);
    }

    moveLeft(distance) {
        let left = vec3.create();
        let movement = vec3.create();
        vec3.cross(left, this.up, this.forward);
        vec3.scale(movement, left, distance);
        vec3.add(this.pos, this.pos, movement);
        vec3.add(this.center, this.pos, this.forward);
    }

    moveUp(distance) {
        let movement = vec3.create();
        vec3.scale(movement, this.up, distance);
        vec3.add(this.pos, this.pos, movement);
        vec3.add(this.center, this.pos, this.forward);
    }

    yawLeft(angle) {
        let rotationMatrix = mat4.create();
        mat4.rotateY(rotationMatrix, rotationMatrix, angle);
        vec3.transformMat4(this.forward, this.forward, rotationMatrix);
        vec3.transformMat4(this.up, this.up, rotationMatrix);
        vec3.add(this.center, this.pos, this.forward);
    }

    pitchUp(angle) {
        let rotationMatrix = mat4.create();
        mat4.rotateX(rotationMatrix, rotationMatrix, angle);
        vec3.transformMat4(this.forward, this.forward, rotationMatrix);
        vec3.transformMat4(this.up, this.up, rotationMatrix);
        vec3.add(this.center, this.pos, this.forward);
    }

    rollLeft(angle) {
        let rotationMatrix = mat4.create();
        mat4.rotateZ(rotationMatrix, rotationMatrix, angle);
        vec3.transformMat4(this.forward, this.forward, rotationMatrix);
        vec3.transformMat4(this.up, this.up, rotationMatrix);
        vec3.add(this.center, this.pos, this.forward);
    }

    getViewMatrix(viewMatrix) {
        mat4.lookAt(viewMatrix, this.pos, this.center, this.up);
    }
}