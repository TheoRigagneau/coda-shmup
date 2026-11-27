export type SinusoidalEnemyData = {
    spawnIntervalMs: number;
    movement: {
        verticalSpeed: number;
        horizontalAmplitude: number;
        horizontalFrequency: number;
    };
    weapon: {
        bulletCount: number;
        spreadAngleDegrees: number;
    };
};
