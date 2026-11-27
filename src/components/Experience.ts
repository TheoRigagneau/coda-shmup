
import IComponent from "./IComponent.ts";
import GameConstants from "../GameConstants.ts";

export default class Experience extends Phaser.Events.EventEmitter implements IComponent {
    public enabled: boolean = true;

    public static readonly CHANGE_EVENT: string = "xpChange";
    public static readonly LEVEL_UP_EVENT: string = "levelUp";

    private _level: number = 1;
    private _current: number = 0;
    private _gainMultiplier: number = 1;

    public get level(): number {
        return this._level;
    }

    public get current(): number {
        return this._current;
    }

    public get required(): number {
        return Experience.requiredForLevel(this._level);
    }

    public setGainMultiplier(multiplier: number): void {
        this._gainMultiplier = multiplier;
    }

    public static requiredForLevel(level: number): number {
        const config = GameConstants.Experience;

        return Math.round(
            config.BASE_XP_TO_LEVEL *
            config.XP_GROWTH_FACTOR ** (level - 1)
        );
    }

    public add(amount: number): void {
        if (!this.enabled || amount <= 0) return;

        // Bonus de classe appliqué au gain
        this._current += amount * this._gainMultiplier;

        // Gestion des passages de niveaux multiples
        while (this._current >= this.required) {
            this._current -= this.required;
            this._level++;

            (window as any).playerLevel = this._level;

            this.emit(
                Experience.LEVEL_UP_EVENT,
                this._level
            );
        }

        this.emit(
            Experience.CHANGE_EVENT,
            this._current,
            this.required,
            this._level
        );
    }
}
