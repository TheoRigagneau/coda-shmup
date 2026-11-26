
export type UpgradeRarity =
    | "COMMON"
    | "RARE"
    | "EPIC"
    | "LEGENDARY"
    | "MYTHIC";

export interface Upgrade {
    id: string;
    name: string;
    description: string;
    rarity: UpgradeRarity;
    weight: number;
}

export const UPGRADE_RARITIES = {
    COMMON: {
        label: "COMMUN",
        color: 0xb8b8b8,
        weight: 55
    },
    RARE: {
        label: "RARE",
        color: 0x36a9e8,
        weight: 25
    },
    EPIC: {
        label: "ÉPIQUE",
        color: 0xa66beb,
        weight: 13
    },
    LEGENDARY: {
        label: "LÉGENDAIRE",
        color: 0xf2a93b,
        weight: 6
    },
    MYTHIC: {
        label: "MYTHIQUE",
        color: 0xf05c75,
        weight: 1
    }
};

export const UPGRADES: Upgrade[] = [
    {
        id: "speed",
        name: "Vitesse",
        description: "+10 % de vitesse",
        rarity: "COMMON",
        weight: 1
    },
    {
        id: "damage",
        name: "Dégâts",
        description: "+1 dégât par projectile",
        rarity: "COMMON",
        weight: 1
    },
    {
        id: "heal",
        name: "Soin",
        description: "Restaure 1 point de vie",
        rarity: "RARE",
        weight: 1
    },
    {
        id: "extra_health",
        name: "Vie supplémentaire",
        description: "+1 point de vie maximum",
        rarity: "RARE",
        weight: 1
    },
    {
        id: "bouncing_bullets",
        name: "Balles rebondissantes",
        description: "+1 rebond pour tes projectiles",
        rarity: "EPIC",
        weight: 1
    },
    {
        id: "piercing_bullets",
        name: "Balles transperçantes",
        description: "+1 ennemi traversé",
        rarity: "LEGENDARY",
        weight: 1
    }
];

export function getRandomUpgrades(
    count: number = 3,
    ownedUpgradeIds: string[] = []
): Upgrade[] {
    const available = UPGRADES.filter(upgrade =>
        upgrade.id !== "piercing_bullets" ||
        !ownedUpgradeIds.includes(upgrade.id)
    );

    const selected: Upgrade[] = [];

    while (selected.length < count && available.length > 0) {
        const totalWeight = available.reduce(
            (total, upgrade) =>
                total +
                UPGRADE_RARITIES[upgrade.rarity].weight * upgrade.weight,
            0
        );

        let random = Math.random() * totalWeight;

        const index = available.findIndex(upgrade => {
            random -=
                UPGRADE_RARITIES[upgrade.rarity].weight * upgrade.weight;

            return random <= 0;
        });

        const safeIndex = index === -1
            ? available.length - 1
            : index;

        selected.push(available[safeIndex]);
        available.splice(safeIndex, 1);
    }

    return selected;
}
