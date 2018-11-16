import Resoluble from './resoluble';
import Entity from '../../entities/entity';
import Field from '../../entities/field';
import TurnContext from '../../contexts/turncontext';
import SerializedProperty from '../../utils/serializedproperty';

export default class Death extends Resoluble {
    public target: Entity;

    constructor(target: Entity) {
        super();

        this.target = target;

        this.type = 'Death';
    }

    public resolve(field: Field, turn_context: TurnContext): void {
        this.target.combat.alive = false;

        field.resolve_entity_death(this.target.team);

        this.resolved = true;
    }
    
    public toJSON(): any {
        const json: any = super.toJSON();

        json.target = new SerializedProperty('Entity', this.target.key);

        return json;
    }

    public static fromJSON(json: any): Death {
        const obj: Death = new Death(json.target);

        return obj;
    }
}