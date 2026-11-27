
import { Input, Scene } from "phaser";
import {
    PlayerShipData,
    PlayerShipsData
} from "../gameData/PlayerShipsData.ts";
import type { BulletData } from "../gameData/BulletData.ts";
import Entity from "./Entity.ts";
import Health from "../components/Health.ts";
import Experience from "../components/Experience.ts";
import Movement from "../components/Movement.ts";
import Weapon from "../components/Weapon.ts";
import GameConstants from "../GameConstants.ts";
import UpgradeManager from "../managers/UpgradeManager.ts";
import type { Upgrade } from "../gameData/UpgradeData.ts";
import RegistryConstants from "../RegistryConstants.ts";

export default class Player extends Entity {
    private readonly _bulletData: BulletData = {
        width: 12,
        height: 4,
        color: 0xffe066,
        speed: 1024,
        damage: 1
    };

    private _playerShipData: PlayerShipData;
    private _rateOfFire: number;
    private _lastShotTime: number;

    private readonly _moveDirection: Phaser.Math.Vector2 =
        new Phaser.Math.Vector2();

    private readonly _shootDirection: Phaser.Math.Vector2 =
        new Phaser.Math.Vector2();

    private _upgradeManager: UpgradeManager;

    private _moveKeys: {
        up: Phaser.Input.Keyboard.Key;
        down: Phaser.Input.Keyboard.Key;
        left: Phaser.Input.Keyboard.Key;
        right: Phaser.Input.Keyboard.Key;
    };

    // Couleur du skin choisi par la classe
    private _classSkinColor: string = "blue";

    private readonly _classSkinColors: Record<string, string> = {
        assault: "red",
        defense: "blue",
        agility: "green",
        technician: "purple"
    };

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, "sprites");

        if (this.scene.input.keyboard) {
            this._moveKeys = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.Z,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.Q,
                right: Phaser.Input.Keyboard.KeyCodes.D
            }) as typeof this._moveKeys;

            // Changement de vaisseau avec les touches 1, 2 et 3
            this.scene.input.keyboard
                .addKey(Input.Keyboard.KeyCodes.ONE)
                .on("down", () => this.selectPlayerShip(1));

            this.scene.input.keyboard
                .addKey(Input.Keyboard.KeyCodes.TWO)
                .on("down", () => this.selectPlayerShip(2));

            this.scene.input.keyboard
                .addKey(Input.Keyboard.KeyCodes.THREE)
                .on("down", () => this.selectPlayerShip(3));
        }
    }

    public init(bulletsGroup: Phaser.Physics.Arcade.Group) {
        this.addComponent(new Health(3, this));
        this.addComponent(new Experience());
        this.addComponent(new Movement());
        this.addComponent(new Weapon(bulletsGroup, this._bulletData));

        this._upgradeManager = new UpgradeManager(this);

        // Récupération de la classe sélectionnée dans HomeScene
        const selectedClass = this.scene.registry.get(
            RegistryConstants.Keys.PLAYER_CLASS
        ) as string | undefined;

        // Association classe / couleur
        this._classSkinColor =
            this._classSkinColors[selectedClass ?? ""] ?? "blue";

        this.angle = -90;

        // Sélection du premier vaisseau avec le bon skin
        this.selectPlayerShip(1);

        this._rateOfFire = 0.5;
        this._lastShotTime = 0;

        this.getComponent(Health)?.on(Health.CHANGE_EVENT, () => {
            this.arcadeBody.setEnable(false);

            this.scene.time.delayedCall(50, () => {
                if (this.active) {
                    this.arcadeBody.setEnable(true);
                }
            });
        });

        const xp = this.getComponent(Experience)!;

        (window as any).xp = xp;
        (window as any).playerMove = this.getComponent(Movement);

        xp.on(
            Experience.LEVEL_UP_EVENT,
            (level: number) => console.log("Niveau", level)
        );
    }

    public selectPlayerShip(playerShipDataId: number) {
        const requiredLevels: { [key: number]: number } = {
            1: 1,
            2: 5,
            3: 10
        };

        const requiredLevel = requiredLevels[playerShipDataId];

        if (requiredLevel === undefined) {
            console.warn("Vaisseau inconnu :", playerShipDataId);
            return;
        }

        const playerLevel =
            this.getComponent(Experience)?.level ?? 1;

        if (playerLevel < requiredLevel) {
            console.log(
                `Vaisseau ${playerShipDataId} verrouillé ! Niveau ${requiredLevel} requis.`
            );
            return;
        }

        const playerShipsData =
            this.scene.cache.json.get("playerShips") as PlayerShipsData;

        this._playerShipData = playerShipsData[playerShipDataId];

        // Construction du nom du sprite selon le vaisseau et la classe
        // Exemple : playerShip1_red, playerShip2_green...
        const skinName = this._playerShipData.texture.replace(
            /_blue$/,
            `_${this._classSkinColor}`
        );

        const textureKey = `skin_${skinName}`;

        if (this.scene.textures.exists(textureKey)) {
            this.setTexture(textureKey);
        } else {
            console.error("Skin introuvable :", textureKey);
        }

        // Mise à jour de la hitbox
        const bodyData = this._playerShipData.body;

        this.arcadeBody.setCircle(
            bodyData.radius,
            bodyData.offsetX,
            bodyData.offsetY
        );

        // Mise à jour de la vitesse
        this.getComponent(Movement)?.setSpeed(
            this._playerShipData.movementSpeed
        );

        console.log(
            `Vaisseau ${playerShipDataId} sélectionné avec le skin ${this._classSkinColor}`
        );
    }

    preUpdate(timeSinceLaunch: number, deltaTime: number) {
        super.preUpdate(timeSinceLaunch, deltaTime);

        this._moveDirection.set(0, 0);

        if (this._moveKeys.left.isDown) {
            this._moveDirection.x -= 1;
        }

        if (this._moveKeys.right.isDown) {
            this._moveDirection.x += 1;
        }

        if (this._moveKeys.up.isDown) {
            this._moveDirection.y -= 1;
        }

        if (this._moveKeys.down.isDown) {
            this._moveDirection.y += 1;
        }

        if (this._moveDirection.lengthSq() > 0) {
            this._moveDirection.normalize();

            this.getComponent(Movement)?.move(
                this,
                this._moveDirection,
                deltaTime
            );

            this.rotation = this._moveDirection.angle();
        }

        // Limites de l'arène
        this.x = Phaser.Math.Clamp(
            this.x,
            this.displayWidth / 2,
            GameConstants.ARENA_WIDTH - this.displayWidth / 2
        );

        this.y = Phaser.Math.Clamp(
            this.y,
            this.displayHeight / 2,
            GameConstants.ARENA_HEIGHT - this.displayHeight / 2
        );

        // Tir à la souris
        if (
            this.scene.input.activePointer.isDown &&
            timeSinceLaunch - this._lastShotTime > this._rateOfFire * 1000
        ) {
            const pointer = this.scene.input.activePointer;

            const target = this.scene.cameras.main.getWorldPoint(
                pointer.x,
                pointer.y
            );

            this._shootDirection.set(
                target.x - this.x,
                target.y - this.y
            ).normalize();

            this.getComponent(Weapon)?.shoot(
                this,
                this._shootDirection
            );

            this.scene.sound.play("sfx_laser1");

            this._lastShotTime = timeSinceLaunch;
        }
    }

    public applyUpgrade(upgrade: Upgrade): void {
        this._upgradeManager.apply(upgrade);
    }

    public getOwnedUpgradeIds(): string[] {
        return this._upgradeManager.getOwnedUpgradeIds();
    }

    public increaseFireRate(multiplier: number = 1.2): void {
        this._rateOfFire /= multiplier;
    }
}
