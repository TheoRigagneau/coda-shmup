
import { Loader } from "phaser";
import GameConstants from "../GameConstants.ts";
import RegistryConstants from "../RegistryConstants.ts";

export default class HomeScene extends Phaser.Scene {
    private static readonly NAME_KEY = "codaShmupPlayerName";

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

        this.load.setPath("assets");

        this.load.image("bg", "Backgrounds/darkPurple.png");
        this.load.image("planet", "Planets/planet00.png");
        this.load.atlas(
            "sprites",
            "Spritesheet/gameSprites.png",
            "Spritesheet/gameSprites.json"
        );
        this.load.bitmapFont(
            "future-bmp",
            "Fonts/kenvector_future.png",
            "Fonts/kenvector_future.xml"
        );
        this.load.font("future", "Fonts/kenvector_future.ttf");
        this.load.json("playerShips", "Data/playerShips.json");
        this.load.audio("sfx_laser1", "Sounds/sfx_laser1.ogg");
        this.load.audio("sfx_laser2", "Sounds/sfx_laser2.ogg");
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;
        const centerY = height / 2;

        this.cameras.main.setBackgroundColor("#090d20");

        // Fond spatial
        if (this.textures.exists("bg")) {
            this.add.image(centerX, centerY, "bg")
                .setDisplaySize(width, height)
                .setAlpha(0.65);
        }

        // Titre
        this.add.text(centerX, centerY - 410, "CODA SHMUP", {
            fontFamily: "future",
            fontSize: "110px",
            color: "#c5c8f2"
        }).setOrigin(0.5);

        this.add.text(centerX, centerY - 270, "PILOTE, IDENTIFIE-TOI", {
            fontFamily: "future",
            fontSize: "40px",
            color: "#929bc9"
        }).setOrigin(0.5);

        // Panneau du lobby
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

        this.add.text(centerX, centerY - 55, "CHOISIS TON PSEUDO", {
            fontFamily: "future",
            fontSize: "38px",
            color: "#b9bee9"
        }).setOrigin(0.5);

        // Pseudo sauvegardé précédemment
        let savedName = "";

        try {
            savedName = localStorage.getItem(
                HomeScene.NAME_KEY
            ) ?? "";
        } catch (error) {
            console.warn("Impossible de lire le pseudo sauvegardé", error);
        }

        // Champ HTML
        const form = this.add.dom(centerX, centerY + 55)
            .createFromHTML(`
                <div style="
                    width: 900px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 30px;
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
                            padding: 25px;
                            border: 2px solid #62699e;
                            border-radius: 12px;
                            background: #171f3b;
                            color: #f0f1ff;
                            font-size: 42px;
                            text-align: center;
                            outline: none;
                        "
                    />

                    <button
                        id="start-game"
                        type="button"
                        style="
                            width: 500px;
                            padding: 25px;
                            border: 0;
                            border-radius: 12px;
                            background: #515987;
                            color: #ffffff;
                            font-size: 38px;
                            font-weight: bold;
                            cursor: pointer;
                            letter-spacing: 3px;
                        "
                    >
                        COMMENCER
                    </button>

                    <div style="
                        color: #929bc9;
                        font-size: 23px;
                    ">
                        12 caractères maximum
                    </div>
                </div>
            `);

        form.setDepth(10);

        const root = form.node as HTMLElement;
        const input = root.querySelector(
            "#pilot-name"
        ) as HTMLInputElement;

        const button = root.querySelector(
            "#start-game"
        ) as HTMLButtonElement;

        let started = false;

        const startGame = () => {
            if (started) return;

            const playerName = input.value
                .trim()
                .replace(/\s+/g, " ")
                .slice(0, 12) || "PILOTE";

            started = true;

            // Sauvegarder le pseudo
            try {
                localStorage.setItem(
                    HomeScene.NAME_KEY,
                    playerName
                );
            } catch (error) {
                console.warn("Impossible de sauvegarder le pseudo", error);
            }

            // Transmettre le pseudo aux autres scènes
            this.registry.set(
                RegistryConstants.Keys.PLAYER_NAME,
                playerName
            );

            form.destroy();

            this.scene.launch(GameConstants.SceneKeys.MAIN_UI);
            this.scene.start(GameConstants.SceneKeys.MAIN_GAME);
        };

        button.addEventListener("click", startGame);

        input.addEventListener("keydown", (event) => {
            event.stopPropagation();

            if (event.key === "Enter") {
                event.preventDefault();
                startGame();
            }
        });

        input.addEventListener("keyup", (event) => {
            event.stopPropagation();
        });

        input.addEventListener("keypress", (event) => {
            event.stopPropagation();
        });

        input.addEventListener("input", () => {

        });

        this.time.delayedCall(150, () => {
            if (input && input.isConnected) {
                input.focus();
                input.select();
            }
        });

        // Nettoyage lors de la fermeture de la scène
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            form.destroy();
        });

        console.log("Lobby created");
    }

    private escapeHTML(value: string): string {
        return value.replace(/[&<>"']/g, (character) => {
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
