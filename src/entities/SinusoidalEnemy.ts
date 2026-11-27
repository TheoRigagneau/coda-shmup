import Health from "../components/Health.ts";
import Movement from "../components/Movement.ts";
import Weapon from "../components/Weapon.ts";
import type {BulletData} from "../gameData/BulletData.ts";
import type {SinusoidalEnemyData} from "../gameData/SinusoidalEnemyData.ts";
import Entity from "./Entity.ts";

export default class SinusoidalEnemy extends Entity {
    public static readonly TEXTURE: string = "playerShip3_blue";

    private static readonly BULLET_DATA: BulletData = {
        width: 12,
        height: 12,
        color: 0xf25f5c,
        speed: 512,
        damage: 1
    };
    private static readonly MIN_SHOOT_COOLDOWN_MS: number = 2000;
    private static readonly MAX_SHOOT_COOLDOWN_MS: number = 3000;

    private _data: SinusoidalEnemyData;
    private _shootTimer?: Phaser.Time.TimerEvent;
    private _baseX: number = 0;
    private _spawnTime: number = 0;

    public init(data: SinusoidalEnemyData, bulletsGroup: Phaser.Physics.Arcade.Group): void {
        this._data = data;
        this.setTexture("sprites", SinusoidalEnemy.TEXTURE);

        this.addComponent(new Health(1, this));
        this.addComponent(new Movement(data.movement.verticalSpeed));
        this.addComponent(new Weapon(bulletsGroup, SinusoidalEnemy.BULLET_DATA));

        this.getComponent(Health)?.on(Health.CHANGE_EVENT, () => {
            this.setTintFill(0xffffff);

            const health = this.getComponent(Health);
            if (health?.current === 0)
                this.disableBody();

            this.scene.time.delayedCall(50, () => {
                this.clearTint();
                if (health?.current === 0)
                    this.disable();
            });
        });

        this.arcadeBody.setCircle(this.displayWidth / 2);
    }

    public enable(x: number, y: number): void {
        this.enableBody(true, x, y - this.displayHeight, true, true);
        this.setAngle(90);
        this.setTint(0xff7777);

        this._baseX = x;
        this._spawnTime = this.scene.time.now;

        const health = this.getComponent(Health);
        health?.heal(health.max, false);

        this.scheduleNextShot();
    }

    public disable(): void {
        this._shootTimer?.remove(false);
        this._shootTimer = undefined;
        this.disableBody(true, true);
    }

    public preUpdate(timeSinceLaunch: number, deltaTime: number): void {
        super.preUpdate(timeSinceLaunch, deltaTime);

        if (this.y > this.scene.cameras.main.height + this.displayHeight) {
            this.disable();
            return;
        }

        const elapsedTime: number = this.scene.time.now - this._spawnTime;
        const horizontalOffset: number = Math.sin(elapsedTime * this._data.movement.horizontalFrequency)
            * this._data.movement.horizontalAmplitude;
        this.x = this._baseX + horizontalOffset;

        this.getComponent(Movement)?.moveVertically(this, this.isTinted ? deltaTime * 0.5 : deltaTime);
    }

    private scheduleNextShot(): void {
        const delay: number = Phaser.Math.Between(
            SinusoidalEnemy.MIN_SHOOT_COOLDOWN_MS,
            SinusoidalEnemy.MAX_SHOOT_COOLDOWN_MS
        );
        this._shootTimer = this.scene.time.delayedCall(delay, this.shoot, [], this);
    }

    private shoot(): void {
        if (!this.active)
            return;

        this.getComponent(Weapon)?.shootSpread(
            this,
            this._data.weapon.bulletCount,
            this._data.weapon.spreadAngleDegrees
        );
        this.scene.sound.play("sfx_laser2");
        this.scheduleNextShot();
    }
}
