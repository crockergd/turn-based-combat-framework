import Resoluble from '../turns/resolubles/resoluble';
import BaseEntity from '../entities/baseentity';
import EntityCallbackContext from '../utils/entitycallbackcontext';
import Turn from '../turns/turn';
import PreturnSnapshot from '../turns/preturnsnapshot';
import Field from '../entities/field';
import Status from '../turns/status';
import TickMode from '../turns/tickmode';

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
    private direct_resoluble_added_callback: (resoluble: Resoluble) => any;
    private direct_resoluble_added_context: any;

    private ASYNC_INTERVAL: number = 3.0;
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
    }

    public get active_turn(): Turn | null {
        if (!(this.turns.length > 0)) return null;
        if (this.resolved) return null;
        return this.turns[this.turns.length - 1];
    }

    public get active_entity(): BaseEntity | null {
        let turn: Turn = this.active_turn;
        if (turn && turn.entity) return turn.entity;
        return null;
    }

    /**
     * Tick entities and determines if any are ready to begin their turn
     */
    public update(dt: number): void {
        switch (this.tick_mode) {
            case TickMode.ASYNC:
                this.update_async(dt);
                break;
            case TickMode.SYNC:
                this.update_sync(dt);
                break;
        }
    }

    private update_async(dt: number): void {
        const entities: Array<BaseEntity> = this.field.get_entities();

        for (let entity of entities) {
            if (entity.temporal_info.action_queued) {
                if (entity.battle_info.alive) {
                    this.request_turn_start(entity);
                    return;
                }
            }
        }

        for (let entity of entities) {
            // if (entity.update(dt)) entity.temporal_info.action_queued = true;

            if (this.update_entity(entity, dt)) {
                // entity.temporal_info.action_queued = true;
            }
        }
    }

    private update_sync(dt: number): void {
        this.async_time += dt;

        if (this.async_time > (this.async_last_turn + this.ASYNC_INTERVAL)) {
            if (this.turns && this.turns.length) this.request_turn_end(false);
            this.request_turn_start(null);

            this.async_last_turn = this.async_time;
        }
    }

    public register_turn_start_callback(callback: (entity: BaseEntity, partial: boolean) => any, context: any, priority: number): void {
        this.turn_start_callbacks.push(new EntityCallbackContext(callback, context, priority));
        this.turn_start_callbacks.sort(EntityCallbackContext.compare);
    }

    public register_turn_end_callback(callback: (entity: BaseEntity, partial: boolean) => any, context: any, priority: number): void {
        this.turn_end_callbacks.push(new EntityCallbackContext(callback, context, priority));
        this.turn_end_callbacks.sort(EntityCallbackContext.compare);
    }

    public register_direct_resoluble_added_callback(callback: (resoluble: Resoluble) => any, context: any): void {
        this.direct_resoluble_added_callback = callback;
        this.direct_resoluble_added_context = context;
    }

    /**
     * Begin a new turn for a given entity
     */
    public request_turn_start(entity: BaseEntity): void {
        this.reset(); // prevent time from flowing for other entities until turn is resolved

        this.turns.push(new Turn(entity, PreturnSnapshot.create(this.field.get_entities()))); // snapshot state and begin a new turn

        if (entity) {
            this.order_entities();

            if (entity.active_spell) {
                for (let callback_context of this.turn_start_callbacks) {
                    callback_context.callback.call(callback_context.context, entity, true);
                }

                // entity.active_spell.cast(entity.active_target);

                // this.add_direct_resoluble(new ReleaseSpell(entity));
                this.request_turn_end(true);
                return;
            }

            entity.temporal_info.current_speed -= entity.temporal_info.speed_cap;

            for (let i: number = entity.battle_info.statuses.length - 1; i >= 0; i--) {
                const entity_status: Status = entity.battle_info.statuses[i];
                if (!entity_status) continue;

                // this.add_direct_resoluble(new TickStatus(entity, entity_status.targetting_key));
            }

            for (let callback_context of this.turn_start_callbacks) {
                if (!entity.battle_info.alive) this.request_turn_end(false); // entity dies as part of a preturn resoluble   
                if (this.resolved) break; // turn ended during the callbacks                

                callback_context.callback.call(callback_context.context, entity, false);
            }
        }
    }

    /**
     * End the current turn
     */
    public request_turn_end(partial: boolean): void {
        let entity: BaseEntity = this.active_entity;
        if (entity) {
            entity.temporal_info.action_queued = false;

            this.order_entities();

            for (let callback_context of this.turn_end_callbacks) {
                callback_context.callback.call(callback_context.context, entity, partial);
            }
        }

        this.resolve(); // allow time to flow normally again for all entities
    }

    /**
     * Returns the most recent turn object for a given entity
     */
    public get_previous_turn(entity: BaseEntity): Turn | null {
        for (let i: number = this.turns.length - 2; i >= 0; i--) {
            if (this.turns[i].key === entity.key) return this.turns[i];
        }

        return null;
    }

    /**
     * Undo the most recent turn tracked by the turn context
     */
    public undo_last_turn(): void {
        if (!(this.turns.length > 1)) return;

        if (!this.resolved) {
            let target_turn: Turn = this.turns.pop(); // pop current active, but unresolved turn
            target_turn.undo();
        }

        let active_turn: Turn = this.turns.pop(); // pop previous, resolved turn
        active_turn.undo();
        this.restore_snapshot(active_turn.preturn_snapshot); // restore preturn state

        // for (let entity of this.field.get_entities()) {
        // if (entity.battle_info.alive) entity.renderable_info.sprite.frame = entity.sprite_info.idle_frame; // resolve any frame inconsistencies
        // }

        this.request_turn_start(active_turn.entity); // begin new active turn
    }

    /**
     * Undo all turns tracked by the turn context
     */
    public restart(): void {
        for (; ;) {
            if (!(this.turns.length > 0) || !this.turns[this.turns.length - 1].entity) break;

            let turn: Turn = this.turns.pop();
            turn.undo();

            if (!(this.turns.length > 0) || !this.turns[this.turns.length - 1].entity) {
                this.restore_snapshot(turn.preturn_snapshot);
                this.request_turn_start(turn.entity);
                break;
            }
        }
    }

    /**
     * Restore temporal state from a preturn snapshot
     */
    private restore_snapshot(preturn_snapshot: PreturnSnapshot): void {
        let entities: Array<BaseEntity> = this.field.get_entities();
        for (let entity of entities) {
            entity.temporal_info = Object.assign({}, preturn_snapshot.entity_snapshots.find(entity_snapshot => entity_snapshot.key === entity.targetting_key).temporal_info);
        }
    }

    /**
     * Resolve an existing turn stack, such as when coming back from a battle save
     * 
     * @param unresolved_turn_stack - Turns to be resolved
     */
    // public simulate_turn_stack(unresolved_turn_stack: Array<any>): void {
    //     let index: number = 0;
    //     for (let unresolved_turn of unresolved_turn_stack) {
    //         if (index === unresolved_turn_stack.length - 1 && !unresolved_turn.resolved) continue;

    //         let current_turn: Turn = new Turn(this.field.get_entity(unresolved_turn.entity), unresolved_turn.preturn_snapshot);
    //         this.turns.push(current_turn);
    //         this.reset();

    //         const hook_callback: EntityCallbackContext = this.turn_start_callbacks.find(callback => callback.priority === 1);
    //         hook_callback.callback.call(hook_callback.context, current_turn.entity, false);

    //         let unresolved_direct_resolubles: Array<Resoluble> = JsonMapper.map_resolubles(unresolved_turn.direct_resolubles, this.field);
    //         let unresolved_resolubles: Array<Resoluble> = unresolved_direct_resolubles;
    //         unresolved_resolubles.sort((lhs, rhs) => {
    //             if (lhs.index < rhs.index) {
    //                 return -1;
    //             }

    //             if (lhs.index > rhs.index) {
    //                 return 1;
    //             }

    //             return 0;
    //         });

    //         for (let unresolved_resoluble of unresolved_resolubles) {
    //             this.add_direct_resoluble(unresolved_resoluble);
    //         }

    //         this.resolve();

    //         index++;
    //     }

    //     let last_turn: any = unresolved_turn_stack[unresolved_turn_stack.length - 1];
    //     this.restore_snapshot(new PreturnSnapshot(last_turn.preturn_snapshot.entity_snapshots));
    // }

    private update_entity(entity: BaseEntity, dt: number): boolean {
        // public update(dt: number): boolean {
        //     if (!this.battle_info.alive) return false;

        //     let variance: number = 1; // Math.random() * (1.25 - 0.75) + 0.75;
        //     let speed_tick: number = (this.battle_info.combat_speed * dt) * variance;
        //     this.temporal_info.current_speed += speed_tick;

        //     return (this.temporal_info.current_speed >= this.temporal_info.speed_cap) && !this.temporal_info.action_queued; // determine if entity can act
        // }
        return false;
    }

    /**
     * Sort active entities by speed values
     */
    public order_entities(): void {
        this.field.entities = this.field.entities.sort((lhs, rhs) => {
            if (lhs.speed_required < rhs.speed_required) return -1;
            if (lhs.speed_required > rhs.speed_required) return 1;

            if (lhs.priority < rhs.priority) return -1;
            if (lhs.priority > rhs.priority) return 1;

            return 0;
        });
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