import GameConstants from "../GameConstants.ts";
import { BulletData } from "../gameData/BulletData.ts";

export type BulletUpgradeOptions = {
    bounces?: number;
    piercing?: boolean;
};

export default class Bullet extends Phaser.GameObjects.Rectangle {
    private _arcadeBody: Phaser.Physics.Arcade.Body;

    private _damage: number = 0;
    private _remainingBounces: number = 0;
    private _piercing: boolean = false;

    private _hitTargets =
        new Set<Phaser.GameObjects.GameObject>();

    public get damage(): number {
        return this._damage;
    }

    public init(): void {
        this.scene.physics.add.existing(this);

        this._arcadeBody =
            this.body as Phaser.Physics.Arcade.Body;

        this._arcadeBody.allowGravity = false;
        this._arcadeBody.setFriction(0, 0);
    }

    public enable(
        x: number,
        y: number,
        velocityX: number,
        velocityY: number,
        data: BulletData,
        options: BulletUpgradeOptions = {}
    ): void {
        this.setPosition(x, y);
        this.setSize(data.width, data.height);
        this.setOrigin(0.5);
        this.setFillStyle(data.color);

        this.scene.physics.world.add(this._arcadeBody);

        this.setActive(true);
        this.setVisible(true);

        this._arcadeBody.setVelocity(velocityX, velocityY);

        this._damage = data.damage;
        this._remainingBounces = options.bounces ?? 0;
        this._piercing = options.piercing ?? false;

        this._hitTargets.clear();

        this.setRotation(this._arcadeBody.velocity.angle());

        const cos = Math.abs(Math.cos(this.rotation));
        const sin = Math.abs(Math.sin(this.rotation));

        this._arcadeBody.setSize(
            data.width * cos + data.height * sin,
            data.width * sin + data.height * cos
        );
    }

    /**
     * Retourne :
     * ignore   : cible déjà touchée
     * continue : le projectile continue
     * disable  : le projectile doit être désactivé
     */
    public handleEnemyHit(
        target: Phaser.GameObjects.GameObject,
        enemies: Phaser.Physics.Arcade.Group
    ): "ignore" | "continue" | "disable" {

        // Ne pas toucher deux fois le même ennemi.
        if (this._hitTargets.has(target)) {
            return "ignore";
        }

        this._hitTargets.add(target);

        // Gestion des rebonds : chercher l'ennemi actif le plus proche.
        if (this._remainingBounces > 0) {
            this._remainingBounces--;

            const availableTargets = enemies.getChildren().filter(
                (enemy): enemy is Phaser.Physics.Arcade.Sprite =>
                    enemy instanceof Phaser.Physics.Arcade.Sprite &&
                    enemy.active &&
                    enemy !== target &&
                    !this._hitTargets.has(enemy)
            );

            if (availableTargets.length > 0) {
                let nearestTarget = availableTargets[0];
                let nearestDistance = Phaser.Math.Distance.Between(
                    this.x,
                    this.y,
                    nearestTarget.x,
                    nearestTarget.y
                );

                for (const enemy of availableTargets) {
                    const distance = Phaser.Math.Distance.Between(
                        this.x,
                        this.y,
                        enemy.x,
                        enemy.y
                    );

                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestTarget = enemy;
                    }
                }

                const speed = this._arcadeBody.velocity.length();

                const direction = new Phaser.Math.Vector2(
                    nearestTarget.x - this.x,
                    nearestTarget.y - this.y
                ).normalize();

                this._arcadeBody.setVelocity(
                    direction.x * speed,
                    direction.y * speed
                );

                this.setRotation(direction.angle());
            }

            // S'il n'y a pas d'autre ennemi, la balle continue sa trajectoire.
            return "continue";
        }

        // Les balles transperçantes continuent après les impacts.
        if (this._piercing) {
            return "continue";
        }

        return "disable";
    }

    public disable(): void {
        this.scene.physics.world.disableBody(this._arcadeBody);

        this.setActive(false);
        this.setVisible(false);

        this._hitTargets.clear();
    }

    update(
    timeSinceLaunch: number,
    deltaTime: number
): void {
    super.update(timeSinceLaunch, deltaTime);

    if (
        this.x < -this.displayWidth ||
        this.x > GameConstants.ARENA_WIDTH + this.displayWidth ||
        this.y < -this.displayHeight ||
        this.y > GameConstants.ARENA_HEIGHT + this.displayHeight
    ) {
        this.disable();
    }
}
}