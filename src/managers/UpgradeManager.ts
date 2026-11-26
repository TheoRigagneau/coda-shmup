import Health from "../components/Health.ts";
import Movement from "../components/Movement.ts";
import Weapon from "../components/Weapon.ts";
import Player from "../entities/Player.ts";
import { Upgrade } from "../gameData/UpgradeData.ts";

export default class UpgradeManager {
    private readonly _player: Player;
    private readonly _levels: Map<string, number> = new Map();

    constructor(player: Player) {
        this._player = player;
    }

    public getOwnedUpgradeIds(): string[] {
        return [...this._levels.keys()];
    }

    public getLevel(id: string): number {
        return this._levels.get(id) ?? 0;
    }

    public apply(upgrade: Upgrade): void {
        // Les balles transperçantes ne peuvent être obtenues qu'une fois.
        if (
            upgrade.id === "piercing_bullets" &&
            this.getLevel(upgrade.id) > 0
        ) {
            return;
        }

        switch (upgrade.id) {
            case "speed": {
                const movement = this._player.getComponent(Movement);

                if (movement) {
                    movement.setSpeed(movement.speed * 1.1);
                }
                break;
            }

            case "damage":
                this._player.getComponent(Weapon)?.increaseDamage(1);
                break;

            case "heal":
                this._player.getComponent(Health)?.heal(1);
                break;

            case "extra_health":
                this._player.getComponent(Health)?.increaseMax(1, true);
                break;

            case "bouncing_bullets":
                this._player.getComponent(Weapon)?.addBounce(1);
                break;

            case "double_shot":
                this._player.getComponent(Weapon)?.addProjectile(1);
                break;

            case "piercing_bullets":
                this._player.getComponent(Weapon)?.enablePiercing();
                break;
            case "fire_rate":
                this._player.increaseFireRate(1.8);
                break;

            case "extra_projectile":
                this._player.getComponent(Weapon)?.addProjectile(1);
                break;

            default:
                console.warn(`Upgrade inconnu : ${upgrade.id}`);
                return;
        }

        this._levels.set(
            upgrade.id,
            this.getLevel(upgrade.id) + 1
        );
    }
}