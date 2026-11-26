import {GameObjects, Scenes, Scene} from "phaser";
import Health from "../components/Health.ts";
import Experience from "../components/Experience.ts";
import Player from "../entities/Player.ts";
import GameConstants from "../GameConstants.ts";
import RegistryConstants from "../RegistryConstants.ts";
import {Upgrade,UPGRADE_RARITIES,getRandomUpgrades} from "../gameData/UpgradeData.ts";

export default class MainUIScene extends Scene {
    private _playerHealthText: GameObjects.BitmapText;
    private _scoreText: GameObjects.BitmapText;
    private _levelText: GameObjects.BitmapText;
    private _xpBar: GameObjects.Graphics;
    private _upgradeOverlay?: GameObjects.Container;

    private static readonly XP_BAR_X: number = 300;
    private static readonly XP_BAR_Y: number = 140;
    private static readonly XP_BAR_HEIGHT: number = 37;
    private _player?: Player;

    constructor() {
        super(GameConstants.SceneKeys.MAIN_UI);
    }

    // noinspection JSUnusedGlobalSymbols
    init() {
        this.game.events.on(GameConstants.Events.PLAYER_SPAWNED_EVENT, this.onPlayerSpawned, this);
        this.registry.events.on(RegistryConstants.Events.PLAYER_SCORE_CHANGE, this.onPlayerScoreChanged, this);
        this.game.events.on(GameConstants.Events.LEVEL_UP_EVENT,
        this.showUpgradeChoices,this);

        this.events.once(Scenes.Events.SHUTDOWN, () => {
            this.game.events.off(GameConstants.Events.PLAYER_SPAWNED_EVENT, this.onPlayerSpawned, this);
            this.registry.events.off(RegistryConstants.Events.PLAYER_SCORE_CHANGE, this.onPlayerScoreChanged, this);
            this.game.events.off(GameConstants.Events.LEVEL_UP_EVENT,
                this.showUpgradeChoices,this);
        }, this);
   
    }

    // noinspection JSUnusedGlobalSymbols
    create() {
        const playerHealthIcon = this.add.image(64, 64, "sprites", "playerLife1_blue")
            .setOrigin(0, 0).setScale(1.5);
        const playerHealthTextX = playerHealthIcon.x + playerHealthIcon.displayWidth + 16;
        this._playerHealthText = this.add.bitmapText(playerHealthTextX, 64, "future-bmp", "x0", 128);

        let scoreStr: string = "".padStart(GameConstants.MAX_SCORE_DIGITS, "0");
        if (this.registry.has(RegistryConstants.Keys.PLAYER_SCORE))
            scoreStr = this.registry.get(RegistryConstants.Keys.PLAYER_SCORE).toString()
                .padStart(GameConstants.MAX_SCORE_DIGITS, "0");
        this._scoreText = this.add.bitmapText(this.scale.width - 64, 64, "future-bmp", scoreStr, 128)
            .setOrigin(1, 0);
        const levelIcon = this.add.image(64, MainUIScene.XP_BAR_Y, "sprites", "star2")
            .setOrigin(0, 0).setScale(1.5);
        this._levelText = this.add.bitmapText(levelIcon.x + levelIcon.displayWidth + 16,
            MainUIScene.XP_BAR_Y, "future-bmp", "1", 128);
        this._xpBar = this.add.graphics();
        this.drawXpBar(0);

        this.scene.bringToTop();

        console.log("MainUIScene created");
    }

    private onPlayerScoreChanged(_: any, value: number) {
        const scoreStr: string = value.toString().padStart(GameConstants.MAX_SCORE_DIGITS, "0");
        this._scoreText.setText(scoreStr);
    }

    private onPlayerSpawned(player: Player) {
        this._player = player;

        const experience = player.getComponent(Experience);

        if (experience) {
            this.onExperienceChanged(
                experience.current,
                experience.required,
                experience.level
            );

            experience.on(
                Experience.CHANGE_EVENT,
                this.onExperienceChanged,
                this
            );
        }

        this._playerHealthText.setText(
            "x" + player.getComponent(Health)?.current
        );

        player.getComponent(Health)?.on(
            Health.CHANGE_EVENT,
            (current: number) => {
                this._playerHealthText.setText("x" + current);
            },
            this
        );
    }
    private drawXpBar(ratio: number) {
    const width: number = this.scale.width - 64 - MainUIScene.XP_BAR_X;

    this._xpBar.clear();
    this._xpBar.fillStyle(0x222222, 0.8);   // fond
    this._xpBar.fillRect(MainUIScene.XP_BAR_X, MainUIScene.XP_BAR_Y, width, MainUIScene.XP_BAR_HEIGHT);
    this._xpBar.fillStyle(0x66e0ff, 1);     // remplissage
    this._xpBar.fillRect(MainUIScene.XP_BAR_X, MainUIScene.XP_BAR_Y,
        width * Phaser.Math.Clamp(ratio, 0, 1), MainUIScene.XP_BAR_HEIGHT);
    }

    private onExperienceChanged(current: number, required: number, level: number) {
        this._levelText.setText(level.toString());
        this.drawXpBar(current / required);
    }

    private showUpgradeChoices(level: number) {
        
        // Supprimer une éventuelle ancienne interface
        this._upgradeOverlay?.destroy(true);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this._upgradeOverlay = this.add.container(0, 0)
            .setDepth(1000);

        // Fond sombre
        const background = this.add.rectangle(
            centerX,
            centerY,
            this.scale.width,
            this.scale.height,
            0x000000,
            0.85
        );

        this._upgradeOverlay.add(background);

        // Titre
        const title = this.add.text(
            centerX,
            centerY - 350,
            `LEVEL ${level} UP!`,
            {
                fontFamily: 'future',
                fontSize: '64px',
                color: '#ffff00'
            }
        ).setOrigin(0.5);

        this._upgradeOverlay.add(title);

        const subtitle = this.add.text(
            centerX,
            centerY - 240,
            'CHOOSE AN UPGRADE',
            {
                fontFamily: 'future',
                fontSize: '32px',
                color: '#ffffff'
            }
        ).setOrigin(0.5);

        this._upgradeOverlay.add(subtitle);

        // Trois choix temporaires
        
        const upgrades = getRandomUpgrades(3,
            this._player?.getOwnedUpgradeIds() ?? []);

                upgrades.forEach((upgrade, index) => {
            const y = centerY - 100 + index * 180;
            const rarity = UPGRADE_RARITIES[upgrade.rarity];

            const card = this.add.rectangle(
                centerX,
                y,
                650,
                130,
                0x292950
            )
                .setStrokeStyle(4, rarity.color)
                .setInteractive({ useHandCursor: true });

            const rarityText = this.add.text(
                centerX,
                y - 35,
                rarity.label,
                {
                    fontFamily: 'future',
                    fontSize: '20px',
                    color: `#${rarity.color.toString(16).padStart(6, '0')}`
                }
            ).setOrigin(0.5);

            const nameText = this.add.text(
                centerX,
                y,
                upgrade.name,
                {
                    fontFamily: 'future',
                    fontSize: '30px',
                    color: '#ffffff'
                }
            ).setOrigin(0.5);

            const descriptionText = this.add.text(
                centerX,
                y + 35,
                upgrade.description,
                {
                    fontFamily: 'future',
                    fontSize: '18px',
                    color: '#cccccc'
                }
            ).setOrigin(0.5);

            card.on('pointerover', () => {
                card.setFillStyle(0x5555aa);
            });

            card.on('pointerout', () => {
                card.setFillStyle(0x292950);
            });

            card.on('pointerdown', () => {
                this.selectUpgrade(upgrade);
            });

            this._upgradeOverlay!.add([
                card,
                rarityText,
                nameText,
                descriptionText
            ]);
        });
    }

    private selectUpgrade(upgrade: Upgrade) {
        console.log("Upgrade selected:", upgrade);

        if (!this._player) {
            console.error("Impossible d'appliquer l'upgrade : joueur introuvable !");
            return;
        }

        this._player.applyUpgrade(upgrade);

        this._upgradeOverlay?.destroy(true);
        this._upgradeOverlay = undefined;

        this.scene.resume(GameConstants.SceneKeys.MAIN_GAME);
    }
}