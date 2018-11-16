import Resoluble from '../turns/resolubles/resoluble';
import Entity from '../entities/entity';
import EntityCallbackContext from '../utils/entitycallbackcontext';
import Turn from '../turns/turn';
import Field from '../entities/field';
import Status from '../turns/status';
import TickMode from '../turns/tickmode';
import * as Resolubles from '../turns/resolubles';
import TickCallbackContext from '../utils/tickcallbackcontext';

/**
 * Synchronizes turns between systems
 */
export default class TurnContext {
    private tick_mode: TickMode;
    public resolved: boolean;

    public turns: Array<Turn>;
    public field: Field;

    private turn_start_callbacks: Array<EntityCallbackContext>;
    private turn_end_callbacks: Array<EntityCallbackContext>;
    private pre_tick_callbacks: Array<TickCallbackContext>;
    private post_tick_callbacks: Array<TickCallbackContext>;
    private direct_resoluble_added_callback: (resoluble: Resoluble) => any;
    private direct_resoluble_added_context: any;

    public delayed_resolubles: Array<Resoluble>;

    private async_interval: number = 3.0;
    private async_time: number;
    private async_last_turn: number;

    constructor(field: Field, tick_mode?: TickMode) {
        if (tick_mode) {
            this.tick_mode = tick_mode;
            this.async_time = 0;
            this.async_last_turn = 0;
        } else {
            this.tick_mode = TickMode.ASYNC;
        }
        this.resolved = true;

        this.turns = new Array<Turn>();
        this.field = field;

        this.turn_start_callbacks = new Array<EntityCallbackContext>();
        this.turn_end_callbacks = new Array<EntityCallbackContext>();
        this.pre_tick_callbacks = new Array<TickCallbackContext>();
        this.post_tick_callbacks = new Array<TickCallbackContext>();

        this.delayed_resolubles = new Array<Resoluble>();
    }

    public get active_turn(): Turn | null {
        if (!(this.turns.length > 0)) return null;
        if (this.resolved) return null;
        return this.turns[this.turns.length - 1];
    }

    public get last_turn(): Turn | null {
        if (!(this.turns.length > 0)) return null;
        return this.turns[this.turns.length - 1];
    }

    public get turn_interval(): number {
        return this.async_interval;
    }

    public get turn_remaining(): number {
        return this.turn_interval - (this.async_time - this.async_last_turn);
    }

    /**
     * Tick entities and determines if any are ready to begin their turn
     */
    public update(dt: number): void {
        switch (this.tick_mode) {
            case TickMode.NONE:
                break;
            case TickMode.ASYNC:
                this.update_async(dt);
                break;
            case TickMode.SYNC:
                this.update_sync(dt);
                break;
        }
    }

    private update_async(dt: number): void {
        
    }

    private update_sync(dt: number): void {
        this.async_time += dt;

        if (this.async_time > (this.async_last_turn + this.async_interval)) {
            if (this.turns && this.turns.length) this.request_turn_end(false);
            this.request_turn_start(null);

            this.async_last_turn = this.async_time;
        }
    }

    public register_turn_start_callback(callback: (entity: Entity, partial: boolean) => any, context: any, priority: number): void {
        this.turn_start_callbacks.push(new EntityCallbackContext(callback, context, priority));
        this.turn_start_callbacks.sort(EntityCallbackContext.compare);
    }

    public register_turn_end_callback(callback: (entity: Entity, partial: boolean) => any, context: any, priority: number): void {
        this.turn_end_callbacks.push(new EntityCallbackContext(callback, context, priority));
        this.turn_end_callbacks.sort(EntityCallbackContext.compare);
    }

    public register_pre_tick_callback(callback: any, context: any): void {
        this.pre_tick_callbacks.push({
            callback: callback,
            context: context
        });    
    }

    public register_post_tick_callback(callback: any, context: any): void {
        this.post_tick_callbacks.push({
            callback: callback,
            context: context
        });    
    }

    public register_direct_resoluble_added_callback(callback: (resoluble: Resoluble) => any, context: any): void {
        this.direct_resoluble_added_callback = callback;
        this.direct_resoluble_added_context = context;
    }

    /**
     * Begin a new turn for a given entity
     */
    public request_turn_start(entity?: Entity): void {
        this.reset(); // prevent time from flowing for other entities until turn is resolved

        this.turns.push(new Turn(entity)); // snapshot state and begin a new turn

        if (entity) {
            for (let i: number = entity.combat.statuses.length - 1; i >= 0; i--) {
                const entity_status: Status = entity.combat.statuses[i];
                if (!entity_status) continue;

                // this.add_direct_resoluble(new TickStatus(entity, entity_status.targetting_key));
            }

            for (let callback_context of this.turn_start_callbacks) {
                if (!entity.combat.alive) this.request_turn_end(false); // entity dies as part of a preturn resoluble   
                if (this.resolved) break; // turn ended during the callbacks                

                callback_context.callback.call(callback_context.context, entity, false);
            }
        }
    }

    /**
     * End the current turn
     */
    public request_turn_end(partial: boolean): void {        
        for (const tick_callback of this.pre_tick_callbacks) {
            tick_callback.callback.call(tick_callback.context);
        }

        if (this.delayed_resolubles && this.delayed_resolubles.length) {
            this.delayed_resolubles = this.delayed_resolubles.filter(resoluble => resoluble.active);

            for (const resoluble of this.delayed_resolubles) {
                this.add_direct_resoluble(resoluble);
            }
            this.delayed_resolubles = new Array<Resoluble>();
        }

        for (const tick_callback of this.post_tick_callbacks) {
            tick_callback.callback.call(tick_callback.context, this.active_turn);
        }

        this.resolve(); // allow time to flow normally again for all entities
    }

    /**
     * Add a resoluble to the current turn to be resolved immediately
     */
    public add_direct_resoluble(resoluble: Resoluble, flag_chained?: boolean): void {
        let target_turn: Turn = this.active_turn;

        if (flag_chained) resoluble.flag_chained();

        target_turn.add_direct_resoluble(resoluble);
        this.direct_resoluble_added_callback.call(this.direct_resoluble_added_context, resoluble);
    }

    /**
     * Add a resoluble to the current turn to be resolved at the end of the current turn
     */
    public add_delayed_resoluble(resoluble: Resoluble, flag_chained?: boolean): void {
        if (flag_chained) resoluble.flag_chained();

        this.delayed_resolubles.push(resoluble);
    }

    public call_resoluble(key: string, delayed: boolean, chained: boolean, ...args: any[]): void {
        const resoluble_type: any = Object.values(Resolubles).find(type => type.name === key);
        const resoluble: any = resoluble_type.prototype.constructor.call(new resoluble_type(), ...args);

        if (delayed) {
            this.add_delayed_resoluble(resoluble, chained);
        } else {
            this.add_direct_resoluble(resoluble, chained);
        }
    }

    /**
     * Unlock the turn context when a turn is finalized
     */
    public resolve(): void {
        this.active_turn.resolved = true;
        this.resolved = true;
    }

    /**
     * Lock the turn context when a turn is begun
     */
    public reset(): void {
        this.resolved = false;
    }
}