
import { Loader } from "phaser";
import GameConstants from "../GameConstants.ts";
import RegistryConstants from "../RegistryConstants.ts";

export default class HomeScene extends Phaser.Scene {
    private static readonly NAME_KEY = "codaShmupPlayerName";

    private static readonly PLAYER_CLASSES = [
        {
            id: "assault",
            name: "ASSAUT",
            skin: "red",
            color: 0xff5555
        },
        {
            id: "defense",
            name: "DÉFENSE",
            skin: "blue",
            color: 0x55aaff
        },
        {
            id: "agility",
            name: "AGILITÉ",
            skin: "green",
            color: 0x55ffbb
        },
        {
            id: "technician",
            name: "TECHNICIEN",
            skin: "purple",
            color: 0xcc88ff
        }
    ];

    constructor() {
        super(GameConstants.SceneKeys.HOME);
    }

    preload() {
        const width = this.scale.width;
        const y = this.scale.height / 2;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();

        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(0, y, width, 64);

        this.load.on(Loader.Events.PROGRESS, (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(0, y, width * value, 64);
        });

        this.load.once(Loader.Events.COMPLETE, () => {
            progressBar.destroy();
            progressBox.destroy();
        });
        this.load.setPath(`${import.meta.env.BASE_URL}assets/`);
        // Chargement des 15 sprites de vaisseaux
        const shipColors = [
            "blue",
            "green",
            "orange",
            "purple",
            "red"
        ];

        for (let ship = 1; ship <= 3; ship++) {
            for (const color of shipColors) {
                const textureName = `playerShip${ship}_${color}`;

                this.load.image(
                    textureName,
                    `sprites/${textureName}.png`
                );
            }
        }

        // Images
        this.load.image("bg", "Backgrounds/space_green.png");
        this.load.image("planet", "Planets/planet00.png");

        // Atlas principal
        this.load.atlas(
            "sprites",
            "Spritesheet/gameSprites.png",
            "Spritesheet/gameSprites.json"
        );
        // Chargement des skins individuels
        const ships = [1, 2, 3];
        const colors = ["blue", "green", "orange", "purple", "red"];

        ships.forEach((ship) => {
            colors.forEach((color) => {
                const textureKey = `skin_playerShip${ship}_${color}`;

                this.load.image(
                    textureKey,
                    `Spritesheet/playerShip${ship}_${color}.png`
                );
            });
        });

        // Polices
        this.load.bitmapFont(
            "future-bmp",
            "Fonts/kenvector_future.png",
            "Fonts/kenvector_future.xml"
        );

        this.load.font("future", "Fonts/kenvector_future.ttf");

        // Données
        this.load.json("playerShips", "Data/playerShips.json");

        // Sons
        this.load.audio("sfx_laser1", "Sounds/sfx_laser1.ogg");
        this.load.audio("sfx_laser2", "Sounds/sfx_laser2.ogg");
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.cameras.main.setBackgroundColor("#090d20");

        // FOND
        if (this.textures.exists("bg")) {
            this.add.image(centerX, centerY, "bg")
                .setDisplaySize(width, height)
                .setAlpha(0.65);
        }

        // TITRE
        this.add.text(centerX, centerY - 410, "PLANE SURVIVOR", {
            fontFamily: "future",
            fontSize: "110px",
            color: "#c5c8f2"
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 270, "PILOTE, IDENTIFIE-TOI", {
            fontFamily: "future",
            fontSize: "40px",
            color: "#929bc9"
        }).setOrigin(0.5);

        // PANNEAU
        const panel = this.add.graphics();

        panel.fillStyle(0x111832, 0.88);
        panel.fillRoundedRect(
            centerX - 650,
            centerY - 145,
            1300,
            470,
            30
        );

        panel.lineStyle(4, 0x62699e, 0.7);
        panel.strokeRoundedRect(
            centerX - 650,
            centerY - 145,
            1300,
            470,
            30
        );

        // PSEUDO SAUVEGARDÉ
        let savedName = "";

        try {
            savedName = localStorage.getItem(
                HomeScene.NAME_KEY
            ) ?? "";
        } catch (error) {
            console.warn("Impossible de lire le pseudo", error);
        }

        // CHAMP PSEUDO
        const form = this.add.dom(centerX, centerY - 55)
            .createFromHTML(`
                <div style="
                    width: 900px;
                    display: flex;
                    justify-content: center;
                    font-family: Arial, sans-serif;
                ">
                    <input
                        id="pilot-name"
                        type="text"
                        maxlength="12"
                        autocomplete="nickname"
                        placeholder="Ton pseudo..."
                        value="${this.escapeHTML(savedName)}"
                        style="
                            width: 750px;
                            box-sizing: border-box;
                            padding: 20px;
                            border: 2px solid #62699e;
                            border-radius: 12px;
                            background: #171f3b;
                            color: #f0f1ff;
                            font-size: 34px;
                            text-align: center;
                            outline: none;
                        "
                    />
                </div>
            `);

        form.setDepth(10);

        const root = form.node as HTMLElement;

        const input = root.querySelector(
            "#pilot-name"
        ) as HTMLInputElement;

        // TITRE DES CLASSES
        this.add.text(centerX, centerY + 35, "CHOISIS TA CLASSE", {
            fontFamily: "future",
            fontSize: "34px",
            color: "#b9bee9"
        }).setOrigin(0.5);

        // CLASSES
        const classes = HomeScene.PLAYER_CLASSES;

        let selectedClass = classes[0];

        // DIMENSIONS DES CARTES
        const cardWidth = 250;
        const cardHeight = 145;
        const cardGap = 25;
        const cardY = centerY + 155;

        const totalWidth = cardWidth * 4 + cardGap * 3;
        const firstX = centerX - totalWidth / 2 + cardWidth / 2;

        const cards: Phaser.GameObjects.Graphics[] = [];

        // DESSIN DES CARTES
        const drawCard = (
            graphics: Phaser.GameObjects.Graphics,
            selected: boolean,
            color: number
        ) => {
            graphics.clear();

            graphics.fillStyle(
                selected ? 0x252e50 : 0x171f3b,
                1
            );

            graphics.fillRoundedRect(
                -cardWidth / 2,
                -cardHeight / 2,
                cardWidth,
                cardHeight,
                15
            );

            graphics.lineStyle(
                selected ? 5 : 2,
                selected ? 0xffffff : color,
                selected ? 1 : 0.6
            );

            graphics.strokeRoundedRect(
                -cardWidth / 2,
                -cardHeight / 2,
                cardWidth,
                cardHeight,
                15
            );
        };

        // CRÉATION DES QUATRE CARTES
        classes.forEach((playerClass, index) => {
            const x = firstX + index * (cardWidth + cardGap);

            const card = this.add.graphics();
            card.setPosition(x, cardY);

            drawCard(
                card,
                index === 0,
                playerClass.color
            );

            cards.push(card);

            // VRAI SPRITE PNG
           const shipTexture = `skin_playerShip1_${playerClass.skin}`;

            if (this.textures.exists(shipTexture)) {
                this.add.image(
                    x,
                    cardY - 20,
                    shipTexture
                ).setDisplaySize(100, 100);
            } else {
                console.error(`Sprite introuvable : ${shipTexture}`);
            }

            // NOM DE LA CLASSE
            this.add.text(
                x,
                cardY + 48,
                playerClass.name,
                {
                    fontFamily: "future",
                    fontSize: "22px",
                    color: `#${playerClass.color
                        .toString(16)
                        .padStart(6, "0")}`
                }
            ).setOrigin(0.5);

            // ZONE DE SÉLECTION
            const zone = this.add.zone(
                x,
                cardY,
                cardWidth,
                cardHeight
            ).setInteractive({
                useHandCursor: true
            });

            zone.on("pointerdown", () => {
                selectedClass = playerClass;

                classes.forEach((currentClass, i) => {
                    drawCard(
                        cards[i],
                        currentClass.id === selectedClass.id,
                        currentClass.color
                    );
                });
            });
        });

        // BOUTON COMMENCER
        const buttonY = centerY + 265;
        const buttonWidth = 450;
        const buttonHeight = 65;

        const buttonGraphics = this.add.graphics();

        const drawButton = (hover: boolean) => {
            buttonGraphics.clear();

            buttonGraphics.fillStyle(
                hover ? 0x737fb9 : 0x515987,
                1
            );

            buttonGraphics.fillRoundedRect(
                centerX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                12
            );
        };

        drawButton(false);

        this.add.text(centerX, buttonY, "COMMENCER", {
            fontFamily: "future",
            fontSize: "30px",
            color: "#ffffff"
        }).setOrigin(0.5);

        const buttonZone = this.add.zone(
            centerX,
            buttonY,
            buttonWidth,
            buttonHeight
        ).setInteractive({
            useHandCursor: true
        });

        buttonZone.on("pointerover", () => drawButton(true));
        buttonZone.on("pointerout", () => drawButton(false));

        // DÉMARRAGE DU JEU
        let started = false;

        const startGame = () => {
            if (started) return;

            const playerName = input.value
                .trim()
                .replace(/\s+/g, " ")
                .slice(0, 12) || "PILOTE";

            started = true;

            // SAUVEGARDE DU PSEUDO
            try {
                localStorage.setItem(
                    HomeScene.NAME_KEY,
                    playerName
                );
            } catch (error) {
                console.warn(
                    "Impossible de sauvegarder le pseudo",
                    error
                );
            }

            // TRANSMISSION DU PSEUDO
            this.registry.set(
                RegistryConstants.Keys.PLAYER_NAME,
                playerName
            );

            // TRANSMISSION DE LA CLASSE
            this.registry.set(
                RegistryConstants.Keys.PLAYER_CLASS,
                selectedClass.id
            );

            form.destroy();

            // LANCEMENT DES SCÈNES
            this.scene.launch(GameConstants.SceneKeys.MAIN_UI);
            this.scene.start(GameConstants.SceneKeys.MAIN_GAME);
        };

        buttonZone.on("pointerdown", startGame);

        // ENTRÉE POUR DÉMARRER
        input.addEventListener("keydown", (event) => {
            event.stopPropagation();

            if (event.key === "Enter") {
                event.preventDefault();
                startGame();
            }
        });

        input.addEventListener("keyup", event => {
            event.stopPropagation();
        });

        input.addEventListener("keypress", event => {
            event.stopPropagation();
        });

        // FOCUS SUR LE PSEUDO
        this.time.delayedCall(150, () => {
            if (input.isConnected) {
                input.focus();
            }
        });

        // NETTOYAGE
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            form.destroy();
        });
    }

    private escapeHTML(value: string): string {
        return value.replace(/[&<>"']/g, character => {
            const entities: Record<string, string> = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return entities[character];
        });
    }
}
