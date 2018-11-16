import TurnContext from './contexts/turncontext';
import Field from './entities/field';
import Entity from './entities/entity';
import TickMode from './turns/tickmode';
import Resoluble from './turns/resolubles/resoluble';
import RenderContext from './contexts/rendercontext';
import HookContext from './contexts/hookcontext';
import * as Resolubles from './turns/resolubles';
import SerializedProperty from './utils/serializedproperty';
import Vector from './utils/vector';

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
        this.turn_context.call_resoluble(key, delayed, false,  ...args);
    }

    public serialize_resoluble(key: string, ...args: any[]): any {
        const resoluble_type: any = this.resoluble_types.find(type => type.name === key);
        const resoluble: any = resoluble_type.prototype.constructor.call(new resoluble_type(), ...args);

        return JSON.stringify(resoluble);
    }

    public deserialize_resoluble(resoluble_json: any, delayed: boolean = true, parse: boolean = true): void {
        let resoluble_obj: any;

        if (parse) {
            resoluble_obj = JSON.parse(resoluble_json);
        } else {
            resoluble_obj = resoluble_json;
        }

        for (const [key, value] of Object.entries(resoluble_obj)) {
            if ((value as any).inflation_type) {
                const serialized_property: SerializedProperty = value as SerializedProperty;

                switch (serialized_property.inflation_type) {
                    case 'Entity':
                        resoluble_obj[key] = this.field.get_entity(serialized_property.property);
                        break;
                }
            }
        }

        const resoluble_type: any = this.resoluble_types.find(type => type.name === resoluble_obj.type);
        const resoluble: any = resoluble_type.fromJSON(resoluble_obj);

        if (delayed) {
            this.turn_context.add_delayed_resoluble(resoluble);
        } else {
            this.turn_context.add_direct_resoluble(resoluble);
        }
    }

    public serialize_turn(): any {
        return JSON.stringify(this.turn_context.active_turn);
    }

    public deserialize_turn(turn_json: any): void {
        const turn_obj: any = JSON.parse(turn_json);

        this.turn_context.request_turn_start();

        for (const resoluble of turn_obj.direct_resolubles) {
            this.deserialize_resoluble(resoluble, false, false);
        }

        this.turn_context.request_turn_end(false);
    }

    public get_team_wiped(): boolean {
        return this.field.team_wiped;
    }

    public get_team_defeated(): number {
        return this.field.team_defeated;
    }

    public get_delayed_resolubles(): Array<Resoluble> {
        return this.turn_context.delayed_resolubles;
    }

    public get_last_turn(): Array<Resoluble> {
        return this.turn_context.last_turn.resolubles;
    }

    public get_entity_by_position(position: Vector): Entity { 
        return this.field.get_entity_by_position(position);
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