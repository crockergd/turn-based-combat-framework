import TurnContext from '../contexts/turncontext';
import RenderContext from '../contexts/rendercontext';
import UpgradeContext from '../contexts/upgradecontext';
import TargetSpecification from '../turns/targets/targetspecification';

export default abstract class Spell {
    public readonly key: string;
    public readonly tag: string;
    public readonly name: string;
    public readonly description: string;

    public readonly cast_time: number;
    public readonly mana_cost: number;
    public readonly temporally_sound: boolean;
    public rank: number;

    protected readonly turn_context: TurnContext;
    protected readonly render_context: RenderContext;
    protected readonly upgrade_context: UpgradeContext;

    constructor(turn_context: TurnContext, render_context: RenderContext, upgrade_context: UpgradeContext) {
        this.cast_time = 0;
        this.mana_cost = 0;
        this.temporally_sound = true;
        this.rank = 0;

        this.turn_context = turn_context;
        this.render_context = render_context;
        this.upgrade_context = upgrade_context;
    }

    public get readable_name(): string {
        let suffix: string = '';
        for (let i: number = 0; i < this.rank; i++) {
            suffix += '+';
        }
        return this.name + suffix;
    }

    // public get readable_description(): string {
    //     let desc: string = this.description;

    //     const matches: Array<string> = desc.match(/(?<={)(.*?)(?=})/g);
    //     if (matches) {
    //         this.initialize_values();

    //         for (const match of matches) {
    //             let replacement_property: string = match;
    //             let to_percentage: boolean = false;

    //             if (replacement_property.charAt(replacement_property.length - 1) === '$') {
    //                 replacement_property = replacement_property.slice(0, -1);
    //                 to_percentage = true;
    //             }

    //             let value: any = this[replacement_property];
    //             if (!value) continue;

    //             if (to_percentage) value = StringExtensions.to_readable_percentage(value);

    //             if (typeof value === 'number') value = Math.round(value);
    
    //             desc = desc.replace('{' + match + '}', value);
    //         }
    //     }

    //     return desc;
    // }

    public abstract cast(target_specification: TargetSpecification): void;
    public abstract apply_baseline(): void;
    public abstract apply_upgrades(): void;

    public pre_cast(target_specification: TargetSpecification): boolean {
        let can_cast: boolean = true;

        // if (this.mana_cost > 0) {
        //     if (!target_specification.source.check_mana_cost(this.mana_cost)) can_cast = false;

        //     // if (can_cast) this.turn_context.add_direct_resoluble(new ModifyResource(fulfillment.source, -this.mana_cost));
        // }

        if (can_cast) {
            this.initialize_values();
        }

        return can_cast;
    }

    /**
     * Determine if entity can succesfully target their selection
     */
    // public can_target(fulfillment: IFulfillable): boolean {
    //     if (fulfillment instanceof SingleTarget) {
    //         return fulfillment.target.battle_info.alive || (!fulfillment.target.battle_info.alive && this.key === 'resurrection');
    //     }

    //     return true;
    // }

    public initialize_values(): void {
        this.apply_baseline();
        this.apply_upgrades();
    }
}