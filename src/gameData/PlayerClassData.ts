
export type PlayerClassId =
    | "assault"
    | "defense"
    | "agility"
    | "technician";

export interface PlayerClass {
    id: PlayerClassId;
    name: string;
    description: string;
    color: number;
    damageMultiplier: number;
    healthMultiplier: number;
    speedMultiplier: number;
    experienceMultiplier: number;
}

export const PLAYER_CLASSES: PlayerClass[] = [
    {
        id: "assault",
        name: "ASSAUT",
        description: "+30% de dégâts",
        color: 0xff5555,
        damageMultiplier: 1.3,
        healthMultiplier: 1,
        speedMultiplier: 1,
        experienceMultiplier: 1
    },
    {
        id: "defense",
        name: "DEFENSE",
        description: "+40% de points de vie",
        color: 0x55aaff,
        damageMultiplier: 1,
        healthMultiplier: 1.4,
        speedMultiplier: 1,
        experienceMultiplier: 1
    },
    {
        id: "agility",
        name: "AGILITE",
        description: "+30% de vitesse",
        color: 0x55ffbb,
        damageMultiplier: 1,
        healthMultiplier: 1,
        speedMultiplier: 1.3,
        experienceMultiplier: 1
    },
    {
        id: "technician",
        name: "TECHNICIEN",
        description: "+30% d'expérience",
        color: 0xcc88ff,
        damageMultiplier: 1,
        healthMultiplier: 1,
        speedMultiplier: 1,
        experienceMultiplier: 1.3
    }
];
