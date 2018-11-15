import Resoluble from './resoluble';
import Vector from '../../utils/vector';
import Entity from '../../entities/entity';
import Field from '../../entities/field';
import TurnContext from '../../contexts/turncontext';
import SerializedProperty from '../../utils/serializedproperty';

export default class Attack extends Resoluble {
    private targetted_positions: Vector[];

    constructor(readonly source: Entity) {
        super();

        this.targetted_positions = [];

        this.type = 'Attack';
    }

    public resolve(field: Field, turn_context: TurnContext): void {
        if (!this.source.alive) return;

        let initial_position: Vector;
        let horizontal: boolean = true;

        if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y > 0) {
            initial_position = new Vector(this.source.spatial.position.x, this.source.spatial.position.y + 1, this.source.spatial.position.z);
            horizontal = false;
        } else if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y < 0) {
            initial_position = new Vector(this.source.spatial.position.x + 1, this.source.spatial.position.y, this.source.spatial.position.z);
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y > 0) {
            initial_position = new Vector(this.source.spatial.position.x - 1, this.source.spatial.position.y, this.source.spatial.position.z);
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y < 0) {
            initial_position = new Vector(this.source.spatial.position.x, this.source.spatial.position.y - 1, this.source.spatial.position.z);
            horizontal = false;
        }

        if (this.source.identifier.class_key === 'bandit') {
            let second_position: Vector;
            let third_position: Vector;

            if (horizontal) {
                second_position = new Vector(initial_position.x, initial_position.y + 1, initial_position.z);
                third_position = new Vector(initial_position.x, initial_position.y - 1, initial_position.z);
            } else {
                second_position = new Vector(initial_position.x + 1, initial_position.y, initial_position.z);
                third_position = new Vector(initial_position.x - 1, initial_position.y, initial_position.z);
            }

            this.targetted_positions.push(initial_position);
            this.targetted_positions.push(second_position);
            this.targetted_positions.push(third_position);

        } else if (this.source.identifier.class_key === 'spearman') {
            let second_position: Vector;

            if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y > 0) {
                second_position = new Vector(initial_position.x, initial_position.y + 1, initial_position.z);
            } else if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y < 0) {
                second_position = new Vector(initial_position.x + 1, initial_position.y, initial_position.z);
            } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y > 0) {
                second_position = new Vector(initial_position.x - 1, initial_position.y, initial_position.z);
            } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y < 0) {
                second_position = new Vector(initial_position.x, initial_position.y - 1, initial_position.z);
            }

            // if (horizontal) {
            //     second_position = new Vector(initial_position.x + 1, initial_position.y, initial_position.z);
            // } else {
            //     second_position = new Vector(initial_position.x, initial_position.y + 1, initial_position.z);
            // }

            this.targetted_positions.push(initial_position);
            this.targetted_positions.push(second_position);
        }

        const targets: Entity[] = [];
        for (const position of this.targetted_positions) {
            const entity: Entity = field.get_entity_by_position(position);
            if (!entity) continue;

            targets.push(entity);
        }

        for (const entity of targets) {
            turn_context.call_resoluble('Damage', true, this.source, entity, 1);
            // console.log(entity);
        }

        // this.source.set('dirty', true);
    }

    public toJSON(): any {
        const json: any = super.toJSON();

        json.source = new SerializedProperty('Entity', this.source.key);

        return json;
    }

    public static fromJSON(json: any): Attack {
        const obj: Attack = new Attack(json.source);

        return obj;
    }
}