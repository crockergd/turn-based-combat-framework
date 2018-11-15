import Entity from './entity';
import Status from '../turns/status';
import Vector from '../utils/vector';

/**
 * Encapsulates and exposes the state of a battle
 */
export default class Field {
    private speed_priority: number;

    public entities: Array<Entity>;
    public status_priority: number;
    public team_wiped: boolean;
    public team_defeated: number;

    constructor() {
        this.entities = new Array<Entity>();
        this.speed_priority = 0;
        this.status_priority = 0;
    }

    public add_entities(entities: Array<Entity>): void {
        for (let entity of entities) {
            this.add_entity(entity);
        }
    }

    public add_entity(entity: Entity): void {
        entity.identifier.priority = this.speed_priority++;
        // entity.name.toLowerCase() + '-' + 
        entity.identifier.key = entity.identifier.priority.toString();
        this.entities.push(entity);
    }

    public get_entities(team?: number, alive?: boolean, excluded_entity?: Entity): Array<Entity> {
        let entities: Array<Entity> = this.entities;

        if (team || team === 0) {
            entities = entities.filter((entity) => {
                return entity.identifier.team === team;
            });
        }

        if (alive || alive === false) {
            entities = entities.filter((entity) => {
                return entity.combat.alive === alive;
            });
        }

        if (excluded_entity) {
            entities = entities.filter(entity => entity.key !== excluded_entity.key);
        }

        return entities;
    }

    public get_entity(targetting_key: string): Entity {
        return this.entities.find(entity => entity.key === targetting_key);
    }

    public get_entity_by_position(position: Vector): Entity {
        for (const entity of this.entities) {
            if (entity.spatial.position.x === position.x && entity.spatial.position.y === position.y && entity.spatial.position.z === position.z) return entity;
        }

        return null;
    }

    /**
     * Verifies if the battle has ended after an entity dies
     * 
     * @param team - Team of the newly deceased entity
     */
    public resolve_entity_death(team: number): void {
        let enemies_remaining: number = this.entities.filter((o) => {
            return o.team === team && o.combat.alive;
        }).length;

        if (!(enemies_remaining > 0)) {
            this.team_wiped = true;
            this.team_defeated = team;
        }
    }

    public toJSON(): any {
        const json: any = {
            entities: this.entities,
            speed_priority: this.speed_priority,
            status_priority: this.status_priority,
            team_wiped: this.team_wiped,
            team_defeated: this.team_defeated
        };

        return json;
    }

    public static fromJSON(json: any): Field {
        const field: Field = new Field();

        field.entities = json.entities.map(entity_json => Entity.fromJSON(entity_json));
        field.speed_priority = json.speed_priority;
        field.status_priority = json.status_priority;
        field.team_wiped = json.team_wiped;
        field.team_defeated = json.team_defeated;

        return field;
    }
}