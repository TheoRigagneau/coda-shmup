import IComponent from "./IComponent.ts";
import GameConstants from "../GameConstants.ts";

export default class Experience extends Phaser.Events.EventEmitter implements IComponent {
    public enabled: boolean = true;

    // Émis avec (current, required, level) après chaque gain d'XP
    public static readonly CHANGE_EVENT: string = 'xpChange';
    // Émis avec (nouveauNiveau) une fois par niveau gagné
    public static readonly LEVEL_UP_EVENT: string = 'levelUp';

    private _level: number = 1;
    private _current: number = 0;

    public get level(): number {
        return this._level;
    }

    // XP accumulée vers le prochain niveau
    public get current(): number {
        return this._current;
    }

    // XP nécessaire pour passer du niveau actuel au suivant
    public get required(): number {
        return Experience.requiredForLevel(this._level);
    }

    public static requiredForLevel(level: number): number {
        const config = GameConstants.Experience;
        return Math.round(config.BASE_XP_TO_LEVEL * config.XP_GROWTH_FACTOR ** (level - 1));
    }

    public add(amount: number): void {
        if (!this.enabled || amount <= 0)
            return;

        this._current += amount;

        // Un gros gain peut franchir plusieurs niveaux d'un coup
        while (this._current >= this.required) {
            this._current -= this.required;
            this._level++;
            (window as any).playerLevel = this._level;
            this.emit(Experience.LEVEL_UP_EVENT, this._level);
        }

        this.emit(Experience.CHANGE_EVENT, this._current, this.required, this._level);
    }
}