export default class GameConstants {
    public static readonly Events = Object.freeze({
        PLAYER_SPAWNED_EVENT: "playerSpawned",
        ENEMY_SPAWNED_EVENT: "enemySpawned",
        LEVEL_UP_EVENT: "levelUp",
    } as const);

    public static readonly SceneKeys = Object.freeze({
        HOME: "HomeScene",
        MAIN_GAME: "MainGameScene",
        MAIN_UI: "MainUIScene",
        GAME_OVER: "GameOverScene",
    } as const);

    public static readonly Experience = Object.freeze({
    // XP pour passer du niveau N au niveau N+1 = BASE_XP_TO_LEVEL + XP_PER_LEVEL_INCREASE * (N - 1)
    BASE_XP_TO_LEVEL: 5,
    XP_GROWTH_FACTOR: 1.4,
} as const);

    public static readonly MAX_SCORE_DIGITS: number = 6;

    public static readonly ARENA_WIDTH: number = 3400;
    public static readonly ARENA_HEIGHT: number = 4700;
    public static readonly ENEMY_SPEED_RATIO: number = 0.33;
}