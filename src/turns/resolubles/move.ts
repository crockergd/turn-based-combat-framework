import Resoluble from './resoluble';
import Entity from '../../entities/entity';
import SerializedProperty from '../../utils/serializedproperty';

export default class Move extends Resoluble {
    constructor(readonly source: Entity) {
        super();

        this.type = 'Move';
    }

    public resolve(): void {
        if (!this.source.alive) return;

        if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y > 0) {
            this.source.spatial.position.y++;
        } else if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y < 0) {
            this.source.spatial.position.x++;
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y > 0) {
            this.source.spatial.position.x--;
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y < 0) {
            this.source.spatial.position.y--;
        }

        // this.source.set('dirty', true);
    }

    public toJSON(): any {
        const json: any = super.toJSON();

        json.source = new SerializedProperty('Entity', this.source.key);

        return json;
    }

    public static fromJSON(json: any): Move {
        const obj: Move = new Move(json.source);

        return obj;
    }
}