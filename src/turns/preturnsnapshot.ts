import BaseEntity from '../entities/baseentity';
import TemporalInfo from '../entities/temporalinfo';

interface TemporalInfoEntry {
    key: string;
    temporal_info: TemporalInfo;
}

/**
 * Express the temporal information for all entities at the moment before a new turn is started
 */
export default class PreturnSnapshot {
    public entity_snapshots: Array<TemporalInfoEntry>;

    constructor(entity_snapshots: Array<TemporalInfoEntry>) {
        this.entity_snapshots = entity_snapshots;
    }

    public static create(entities: Array<BaseEntity>): PreturnSnapshot {
        let cloned_entity_snapshots: Array<TemporalInfoEntry> = entities.map(o => {
            return {
                key: o.targetting_key,
                temporal_info: Object.assign({}, o.temporal_info)
            };
        });

        return new PreturnSnapshot(cloned_entity_snapshots);
    }

    public toJSON(): any {
        let json: any = {
            entity_snapshots: this.entity_snapshots        
        };

        return json;
    } 
}