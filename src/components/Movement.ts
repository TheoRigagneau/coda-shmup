
import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";

export default class Movement implements IComponent {
    public enabled: boolean = true;

    private _speed: number = 0;
    private _speedMultiplier: number = 1;

    public constructor(speed?: number) {
        if (speed !== undefined) {
            this._speed = speed;
        }
    }

    public setSpeed(speed: number) {
        this._speed = speed;
    }

    public setSpeedMultiplier(multiplier: number) {
        this._speedMultiplier = multiplier;
    }

    public get speed(): number {
        return this._speed * this._speedMultiplier;
    }

    public moveHorizontally(entity: Entity, deltaTime: number) {
        if (!this.enabled) return;

        entity.x += this.speed * deltaTime;
    }

    public moveVertically(entity: Entity, deltaTime: number) {
        if (!this.enabled) return;

        entity.y += this.speed * deltaTime;
    }

    public move(
        entity: Entity,
        direction: Phaser.Math.Vector2,
        deltaTime: number
    ) {
        if (!this.enabled) return;

        entity.x += direction.x * this.speed * deltaTime;
        entity.y += direction.y * this.speed * deltaTime;
    }
}
