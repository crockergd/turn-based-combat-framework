import Entity from '../entities/entity';
import Resoluble from './resolubles/resoluble';

/**
 * Object representing the actions of a turn
 */
export default class Turn {
    private direct_resolubles: Array<Resoluble>;
    private index: number;
    public resolved: boolean;

    constructor(entity: Entity) {
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

    public add_direct_resoluble(resoluble: Resoluble): void {
        resoluble.index = this.index;
        this.direct_resolubles.push(resoluble);

        this.index++;
    }

    public toJSON(): any {
        let json: any = {
            direct_resolubles: this.direct_resolubles.filter(resoluble => !resoluble.chained),
            resolved: this.resolved
        };

        return json;
    }
}