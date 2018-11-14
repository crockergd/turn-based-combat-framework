import TurnContext from './contexts/turncontext';
import Field from './entities/field';
import Entity from './entities/entity';
import TickMode from './turns/tickmode';
import Resoluble from './turns/resolubles/resoluble';
import RenderContext from './contexts/rendercontext';
import HookContext from './contexts/hookcontext';
import * as Resolubles from './turns/resolubles';

export default class Battle {
    private field: Field;
    private turn_context: TurnContext;
    private render_context: RenderContext;
    private hook_context: HookContext;

    private resoluble_types: any[];

    constructor(private readonly tick_mode: TickMode) {
        this.field = new Field();

        this.turn_context = new TurnContext(this.field, this.tick_mode);
        this.turn_context.register_direct_resoluble_added_callback(this.direct_resoluble_added, this);

        this.turn_context.request_turn_start(null);

        this.resoluble_types = Object.values(Resolubles);
    }

    public get turn_interval(): number {
        return this.turn_context.turn_interval;
    }

    public get turn_remaining(): number {
        return this.turn_context.turn_remaining;
    }

    public add_entity(entity: Entity, team: number): void {
        entity.identifier.team = team;

        entity.stat = {
            vitality: 1,
            speed: 1,
            strength: 1,
            intelligence: 1,
            dexterity: 0
        };

        this.field.add_entity(entity);
    }

    public get_entities(): Array<Entity> {
        return this.field.entities;
    }

    public update(dt: number): void {
        this.turn_context.update(dt);
    }

    public register_resoluble(type: any): void {
        this.resoluble_types.push(type);
    }

    public call_resoluble(key: string, delayed: boolean, ...args: any[]): void {
        const resoluble_type: any = this.resoluble_types.find(type => type.name === key);
        const resoluble: any = resoluble_type.prototype.constructor.call(new resoluble_type(), ...args);

        if (delayed) {
            this.turn_context.add_delayed_resoluble(resoluble);
        } else {
            this.turn_context.add_direct_resoluble(resoluble);
        }
    }

    public add_delayed_resoluble(resoluble: Resoluble): void {
        this.turn_context.add_delayed_resoluble(resoluble);
    }

    public register_pre_tick_callback(callback: any, context?: any): void {
        this.turn_context.register_pre_tick_callback(callback, context);
    }

    public register_post_tick_callback(callback: any, context?: any): void {
        this.turn_context.register_post_tick_callback(callback, context);
    }

    private direct_resoluble_added(resoluble: Resoluble): void {
        resoluble.resolve(this.field, this.turn_context, this.render_context, this.hook_context);
    }
    
    public toJSON(): any {
        const json: any = {
            tick_mode: this.tick_mode,
            field: this.field
        };

        return json;
    }

    public static fromJSON(json: any): Battle {
        const obj: Battle = new Battle(json.tick_mode);

        obj.field = Field.fromJSON(json.field);

        return obj;
    }
}