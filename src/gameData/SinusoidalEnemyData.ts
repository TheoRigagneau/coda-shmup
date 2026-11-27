import type {BulletData} from "./BulletData.ts";

export type SinusoidalEnemyData = {
    spawnIntervalMs: number;
    maxActive: number;
    texture: string;
    movement: {
        verticalSpeed: number;
        horizontalAmplitude: number;
        horizontalFrequency: number;
    };
    weapon: {
        cooldownMinMs: number;
        cooldownMaxMs: number;
        bulletCount: number;
        spreadAngleDegrees: number;
        bullet: BulletData;
    };
};
