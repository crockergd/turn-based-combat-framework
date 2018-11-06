import BaseEntity from '../entities/baseentity';
import Resoluble from './resolubles/resoluble';
import PreturnSnapshot from './preturnsnapshot';

/**
 * Object representing the actions of a turn for a single entity
 */
export default class Turn {
    public entity: BaseEntity;
    public preturn_snapshot: PreturnSnapshot;
    private direct_resolubles: Array<Resoluble>;
    private index: number;
    public resolved: boolean;

    constructor(entity: BaseEntity, preturn_snapshot: PreturnSnapshot) {
        this.entity = entity;
        this.preturn_snapshot = preturn_snapshot;
        this.direct_resolubles = new Array<Resoluble>();
        this.index = 0;
        this.resolved = false;
    }

    public get resolubles(): Array<Resoluble> {
        let resolubles: Array<Resoluble> = this.direct_resolubles;

        return resolubles.sort((lhs, rhs) => {
            return lhs.index - rhs.index;
        });
    }

    public get key(): string {
        return this.entity.key;
    }

    public add_direct_resoluble(resoluble: Resoluble): void {
        resoluble.index = this.index;
        this.direct_resolubles.push(resoluble);

        this.index++;
    }

    public undo(): void {
        let resolubles: Array<Resoluble> = this.resolubles;

        for (let i: number = resolubles.length - 1; i >= 0; i--) {
            this.resolubles[i].undo(); // undo resolutions in reverse order
        }
    }

    public toJSON(): any {
        let json: any = {
            entity: this.entity ? this.entity.targetting_key : null,
            preturn_snapshot: this.preturn_snapshot,
            direct_resolubles: this.direct_resolubles.filter(resoluble => !resoluble.chained),
            resolved: this.resolved
        };

        return json;
    }
}