
import GameConstants from "../GameConstants.ts";
import RegistryConstants from "../RegistryConstants.ts";

type ScoreEntry = {
    score: number;
    name: string;
    playedAt: number;
};

export default class GameOverScene extends Phaser.Scene {
    private static readonly LEADERBOARD_KEY = "codaShmupLeaderboard";

    private currentRunTimestamp = 0;

    constructor() {
        super(GameConstants.SceneKeys.GAME_OVER);
    }

    create() {
        const playerName =this.registry.get(RegistryConstants.Keys.PLAYER_NAME) ?? "PILOTE";

        this.scene.stop(GameConstants.SceneKeys.MAIN_UI);
        const width = this.scale.width;
        const height = this.scale.height;
        const centerX = width / 2;

        const currentScore = Math.max(
            0,
            Number(this.registry.get(RegistryConstants.Keys.PLAYER_SCORE) ?? 0)
        );

        const { entries, playerRank } = this.recordRun(currentScore,playerName);
        const enteredTopTen = playerRank <= 10;

        // Fond spatial discret
        this.cameras.main.setBackgroundColor("#090d20");

        const background = this.add.graphics();
        background.fillStyle(0x111a38, 0.34);
        background.fillRect(0, 0, width, height);

        // Étoiles
        for (let i = 0; i < 75; i++) {
            const x = Phaser.Math.Between(20, width - 20);
            const y = Phaser.Math.Between(20, height - 20);
            const radius = Phaser.Math.FloatBetween(1.5, 3.5);

            this.add.circle(
                x,
                y,
                radius,
                0xaab5ed,
                Phaser.Math.FloatBetween(0.12, 0.4)
            );
        }

        // GAME OVER
        const titleY = height * 0.105;

        this.add.text(centerX, titleY, "GAME OVER", {
            fontFamily: "future",
            fontSize: `${Math.min(104, width * 0.027)}px`,
            color: "#c5c8f2",
            align: "center"
        }).setOrigin(0.5);

        // SCORE FINAL
        this.add.text(centerX, titleY + 112, "SCORE FINAL", {
            fontFamily: "future",
            fontSize: `${Math.min(34, width * 0.009)}px`,
            color: "#929bc9",
            align: "center"
        }).setOrigin(0.5);

        this.add.text(
            centerX,
            titleY + 184,
            this.formatScore(currentScore),
            {
                fontFamily: "future",
                fontSize: `${Math.min(66, width * 0.017)}px`,
                color: "#f0f1ff",
                align: "center"
            }
        ).setOrigin(0.5);

        // Dimensions du classement
        const panelWidth = Math.min(width * 0.62, 1900);
        const rowHeight = Math.min(82, height * 0.038);
        const headerHeight = 112;

        const visibleRows = enteredTopTen ? 10 : 11;
        const panelHeight =
            headerHeight + visibleRows * rowHeight + 48;

        const panelX = centerX - panelWidth / 2;
        const panelY = titleY + 285;

        // Panneau principal
        const panel = this.add.graphics();

        panel.fillStyle(0x111832, 0.82);
        panel.fillRoundedRect(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            28
        );

        panel.lineStyle(4, 0x62699e, 0.72);
        panel.strokeRoundedRect(
            panelX,
            panelY,
            panelWidth,
            panelHeight,
            28
        );

        this.add.text(centerX, panelY + 52, "TOP 10", {
            fontFamily: "future",
            fontSize: `${Math.min(42, width * 0.011)}px`,
            color: "#b9bee9",
            align: "center"
        }).setOrigin(0.5);

        const firstRowY = panelY + headerHeight;

        const displayEntries = enteredTopTen
            ? entries.slice(0, 10)
            : [
                ...entries.slice(0, 10),
                entries[playerRank - 1]
            ];

        displayEntries.forEach((entry, index) => {
            if (!entry) return;

            const isPlayer =
                entry.playedAt === this.currentRunTimestamp;

            const y = firstRowY + index * rowHeight;
            const rowTop = y - rowHeight / 2;

            if (isPlayer) {
                const highlight = this.add.graphics();

                highlight.fillStyle(0x62649d, 0.48);
                highlight.fillRoundedRect(
                    panelX + 34,
                    rowTop + 4,
                    panelWidth - 68,
                    rowHeight - 8,
                    16
                );
            }

            const rankText = index === 10
                ? `#${playerRank}`
                : `${index + 1}`;

            const color = isPlayer
                ? "#f0f0ff"
                : index < 3
                    ? "#c4c9f0"
                    : "#aab1d5";

            const name = entry.name;

            const rank = this.add.text(
                panelX + 105,
                y,
                rankText,
                {
                    fontFamily: "future",
                    fontSize: `${Math.min(32, width * 0.0085)}px`,
                    color,
                    align: "left"
                }
            ).setOrigin(0, 0.5);

            const playerName = this.add.text(
                panelX + 300,
                y,
                name,
                {
                    fontFamily: "future",
                    fontSize: `${Math.min(32, width * 0.0085)}px`,
                    color,
                    align: "left"
                }
            ).setOrigin(0, 0.5);

            const score = this.add.text(
                panelX + panelWidth - 105,
                y,
                this.formatScore(entry.score),
                {
                    fontFamily: "future",
                    fontSize: `${Math.min(32, width * 0.0085)}px`,
                    color,
                    align: "right"
                }
            ).setOrigin(1, 0.5);

            [rank, playerName, score].forEach((text) => {
                text.setAlpha(0);
                text.y -= 18;

                this.tweens.add({
                    targets: text,
                    y,
                    alpha: 1,
                    duration: 420,
                    delay: 120 + index * 65,
                    ease: "Sine.Out"
                });
            });
        });

        if (enteredTopTen) {
            const notice = this.add.text(
                centerX,
                panelY + panelHeight + 56,
                "NOUVELLE PLACE DANS LE TOP 10",
                {
                    fontFamily: "future",
                    fontSize: `${Math.min(27, width * 0.007)}px`,
                    color: "#aeb5e8",
                    align: "center"
                }
            );

            notice.setOrigin(0.5);
            notice.setAlpha(0);

            this.tweens.add({
                targets: notice,
                alpha: 1,
                y: panelY + panelHeight + 44,
                duration: 500,
                delay: 900,
                ease: "Sine.Out"
            });
        }

        this.add.text(
            centerX,
            height - 90,
            "ESPACE  ·  RETOUR AU MENU",
            {
                fontFamily: "future",
                fontSize: `${Math.min(26, width * 0.0068)}px`,
                color: "#858fb9",
                align: "center"
            }
        ).setOrigin(0.5);

        this.input.keyboard?.on(
            "keydown-SPACE",
            (event: KeyboardEvent) => {
                if (event.repeat) return;

                this.scene.start(GameConstants.SceneKeys.HOME);
            }
        );

        console.log(
            `[GameOverScene] Score: ${currentScore}, rank: ${playerRank}`
        );
    }

    private recordRun(
        score: number,playerName: string): 
        { entries: ScoreEntry[]; playerRank: number } {
        let entries: ScoreEntry[] = [];

        try {
            const saved = localStorage.getItem(
                GameOverScene.LEADERBOARD_KEY
            );

            const parsed: unknown = saved
                ? JSON.parse(saved)
                : [];

            if (Array.isArray(parsed)) {
                entries = parsed.filter(
                    (entry): entry is ScoreEntry =>
                        entry !== null &&
                        typeof entry === "object" &&
                        typeof entry.score === "number" &&
                        typeof entry.name === "string" &&
                        typeof entry.playedAt === "number"
                );
            }
        } catch (error) {
            console.warn(
                "[GameOverScene] Could not read leaderboard:",
                error
            );
        }

        this.currentRunTimestamp = Date.now();

        const currentRun: ScoreEntry = {
            score,
            name: playerName,
            playedAt: this.currentRunTimestamp
        };

        entries.push(currentRun);

        entries.sort(
            (a, b) =>
                b.score - a.score ||
                a.playedAt - b.playedAt
        );

        const playerRank = entries.indexOf(currentRun) + 1;

        try {
            localStorage.setItem(
                GameOverScene.LEADERBOARD_KEY,
                JSON.stringify(entries)
            );
        } catch (error) {
            console.warn(
                "[GameOverScene] Could not save leaderboard:",
                error
            );
        }

        return {
            entries,
            playerRank
        };
    }

    private formatScore(score: number): string {
        return Math.floor(score)
            .toLocaleString("fr-FR")
            .replace(/\u202f/g, " ");
    }
}
