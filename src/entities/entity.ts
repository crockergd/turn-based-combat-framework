import IdentifierInfo from './identifierinfo';
import StatInfo from './statinfo';
import BattleInfo from './battleinfo';
import SpatialInfo from './spatialinfo';
import CustomProperty from './customproperty';

export default class Entity {
    public identifier: IdentifierInfo;
    public stat: StatInfo;
    public combat: BattleInfo;
    public spatial: SpatialInfo;
    private properties: Map<string, CustomProperty>;

    public get key(): string {
        return this.identifier.key;
    }

    public get team(): number {
        return this.identifier.team;
    }

    public get alive(): boolean {
        return this.combat.alive;
    }

    constructor() {
        this.identifier = {};
        this.stat = {};
        this.combat = {
            alive: true
        };
        this.spatial = {};
        this.properties = new Map<string, any>();
    }

    public get(key: string): any {
        const custom: CustomProperty = this.properties.get(key);
        if (!custom) return null;

        return custom.property;
    }

    public set(key: string, property: any, serializable: boolean = true): void {
        const custom: CustomProperty = {
            serializable: serializable,
            property: property
        };
        this.properties.set(key, custom);
    }

    public toJSON(): any {
        const json: any = {
            identifier: this.identifier,
            stat: this.stat,
            combat: this.combat,
            spatial: this.spatial,
            // properties: this.properties
        };

        return json;
    }

    public static fromJSON(json: any): Entity {
        const entity: Entity = new Entity();

        entity.identifier = json.identifier;
        entity.stat = json.stat;
        entity.combat = json.combat;
        entity.spatial = json.spatial;
        // entity.properties = json.properties;

        return entity;
    }
}