import BaseEntity from './baseentity';
import Team from './team';
import Status from '../turns/status';
import { EntityRelation } from './entityrelation';

/**
 * Encapsulates and exposes the state of a battle
 */
export default class Field {
    private speed_priority: number;

    public entities: Array<BaseEntity>;
    public status_priority: number;
    public expired_statuses: Array<Status>;
    public team_wiped: boolean;
    public team_defeated: Team;

    constructor() {
        this.entities = new Array<BaseEntity>();
        this.speed_priority = 0;
        this.status_priority = 0;
        this.expired_statuses = new Array<Status>();
    }

    public add_entities(entities: Array<BaseEntity>): void {
        for (let entity of entities) {
            this.add_entity(entity);
        }
    }

    public add_entity(entity: BaseEntity): void {
        entity.priority = this.speed_priority++;
        // entity.name.toLowerCase() + '-' + 
        entity.targetting_key = entity.priority.toString();
        this.entities.push(entity);
    }

    public get_entities(team?: Team, alive?: boolean, excluded_entity?: BaseEntity): Array<BaseEntity> {
        let entities: Array<BaseEntity> = this.entities;

        if (team || team === 0) {
            entities = entities.filter((entity) => {
                return entity.team === team;
            });
        }

        if (alive || alive === false) {
            entities = entities.filter((entity) => {
                return entity.battle_info.alive === alive;
            });
        }

        if (excluded_entity) {
            entities = entities.filter(entity => entity.targetting_key !== excluded_entity.targetting_key);
        }

        return entities;
    }

    public get_entity(targetting_key: string): BaseEntity {
        return this.entities.find(entity => entity.targetting_key === targetting_key);
    }

    public get_entity_by_relation(relation: EntityRelation, related_entity?: BaseEntity): BaseEntity {
        switch (relation) {
            case EntityRelation.NEAREST:
                if (this.entities.length > related_entity.priority) {
                    const incremented_entity: BaseEntity = this.entities.find(entity => entity.priority === related_entity.priority + 1);
                    if (incremented_entity.team === related_entity.team && incremented_entity.battle_info.alive) return incremented_entity;
                }

                if (related_entity.priority > 0) {
                    const decremented_entity: BaseEntity = this.entities.find(entity => entity.priority === related_entity.priority - 1);
                    if (decremented_entity.team === related_entity.team && decremented_entity.battle_info.alive) return decremented_entity;
                }

                return null;
        }
    }

    /**
     * Verifies if the battle has ended after an entity dies
     * 
     * @param team - Team of the newly deceased entity
     */
    public resolve_entity_death(team: Team): void {
        let enemies_remaining: number = this.entities.filter((o) => {
            return o.team === team && o.battle_info.alive;
        }).length;

        if (!(enemies_remaining > 0)) {
            this.team_wiped = true;
            this.team_defeated = team;
        }
    }

    public reorder(): void {
        this.entities = this.entities.sort(this.entity_compare);
    }

    public entity_compare(lhs: BaseEntity, rhs: BaseEntity): number {
        if (lhs.speed_required < rhs.speed_required) {
            return -1;
        }

        if (lhs.speed_required > rhs.speed_required) {
            return 1;
        }

        return 0;
    }
}