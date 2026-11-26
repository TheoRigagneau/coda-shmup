import { Physics } from "phaser";
import { BulletData } from "../gameData/BulletData.ts";
import Bullet, { BulletUpgradeOptions } from "../entities/Bullet.ts";
import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";

export default class Weapon implements IComponent {
    public enabled: boolean = true;

    private readonly _bullets: Physics.Arcade.Group;
    private readonly _bulletData: BulletData;

    private _projectileCount: number = 1;
    private _bounceCount: number = 0;
    private _piercing: boolean = false;

    constructor(
        bullets: Physics.Arcade.Group,
        bulletData: BulletData
    ) {
        if (!bullets) {
            console.error("Weapon bullets group cannot be null");
        }

        this._bullets = bullets;

        // Copie locale pour ne pas modifier les données partagées.
        this._bulletData = { ...bulletData };
    }

    public increaseDamage(amount: number = 1): void {
        this._bulletData.damage += amount;
    }

    public addProjectile(amount: number = 1): void {
        this._projectileCount += amount;
    }

    public addBounce(amount: number = 1): void {
        this._bounceCount += amount;
    }

    public enablePiercing(): void {
        this._piercing = true;
    }

    public shoot(
        source: Entity,
        direction?: Phaser.Math.Vector2
    ): void {
        if (!this.enabled || !this._bullets) return;

        const forward = direction ??
            new Phaser.Math.Vector2(1, 0).rotate(source.rotation);

        const spreadStep = 0.14;

        const startAngle =
            -((this._projectileCount - 1) * spreadStep) / 2;

        const options: BulletUpgradeOptions = {
            bounces: this._bounceCount,
            piercing: this._piercing
        };

        for (let i = 0; i < this._projectileCount; i++) {
            const shotDirection = forward.clone()
                .rotate(startAngle + i * spreadStep)
                .normalize();

            const bullet = this._bullets.get() as Bullet;

            if (!bullet) continue;

            const velocity = shotDirection.clone()
                .scale(this._bulletData.speed);

            bullet.enable(
                source.x + shotDirection.x * source.arcadeBody.radius,
                source.y + shotDirection.y * source.arcadeBody.radius,
                velocity.x,
                velocity.y,
                this._bulletData,
                options
            );
        }
    }
}