import Resoluble from './resoluble';
import Entity from '../../entities/entity';
import SerializedProperty from '../../utils/serializedproperty';
import Vector from '../../utils/vector';
import Field from '../../entities/field';

export default class Move extends Resoluble {
    constructor(readonly source: Entity) {
        super();

        this.type = 'Move';
    }

    public resolve(field: Field): void {
        if (!this.source.alive) return;

        const new_position: Vector = Move.calculate_new_position(this.source.spatial.position, this.source.spatial.facing);
        this.source.spatial.position.x = new_position.x;
        this.source.spatial.position.y = new_position.y;
        this.source.spatial.position.z = new_position.z;

        // this.source.set('dirty', true);
    }

    public static calculate_new_position(position: Vector, facing: Vector): Vector {
        const new_position: Vector = Vector.create_from_vector(position);

        if (facing.x > 0 && facing.y > 0) {
            new_position.y++;
        } else if (facing.x > 0 && facing.y < 0) {
            new_position.x++;
        } else if (facing.x < 0 && facing.y > 0) {
            new_position.x--;
        } else if (facing.x < 0 && facing.y < 0) {
            new_position.y--;
        }

        return new_position;
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