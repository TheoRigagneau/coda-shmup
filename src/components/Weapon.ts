import {Physics} from 'phaser';
import {BulletData} from "../gameData/BulletData.ts";
import Bullet from "../entities/Bullet.ts";
import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";

export default class Weapon implements IComponent {
    public enabled: boolean = true;

    private readonly _bullets: Physics.Arcade.Group;
    private readonly _bulletData: BulletData;

    constructor(bullets: Physics.Arcade.Group, bulletData: BulletData) {
        if (!bullets) {
            console.error("Weapon 'bullets' group cannot be null or undefined");
        }

        this._bullets = bullets;
        this._bulletData = bulletData;
    }

    public shoot(source: Entity) {
        if (!this.enabled)
            return;

        if (!this._bullets)
            return;

        this.fireBullet(source, source.rotation);
    }

    public shootSpread(source: Entity, bulletCount: number, spreadAngleDegrees: number): void {
        if (!this.enabled || !this._bullets || bulletCount <= 0)
            return;

        const bulletCountAsInteger: number = Math.floor(bulletCount);
        if (bulletCountAsInteger <= 0)
            return;

        if (bulletCountAsInteger === 1) {
            this.fireBullet(source, source.rotation);
            return;
        }

        const spreadAngleRadians: number = Phaser.Math.DegToRad(spreadAngleDegrees);
        const firstBulletAngle: number = source.rotation - spreadAngleRadians / 2;
        const angleStep: number = spreadAngleRadians / (spreadAngleDegrees === 360
            ? bulletCountAsInteger
            : bulletCountAsInteger - 1);

        for (let bulletIndex: number = 0; bulletIndex < bulletCountAsInteger; bulletIndex++) {
            this.fireBullet(source, firstBulletAngle + angleStep * bulletIndex);
        }
    }

    private fireBullet(source: Entity, angle: number): void {
        const bullet: Bullet = this._bullets.get() as Bullet;
        if (!bullet)
            return;

        const bulletDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0).rotate(angle);
        const bulletVelocity: Phaser.Math.Vector2 = bulletDirection.clone().scale(this._bulletData.speed);
        const spawnX: number = source.x + bulletDirection.x * source.arcadeBody.radius;
        const spawnY: number = source.y + bulletDirection.y * source.arcadeBody.radius;

        bullet.enable(spawnX, spawnY, bulletVelocity.x, bulletVelocity.y, this._bulletData);
    }
}
