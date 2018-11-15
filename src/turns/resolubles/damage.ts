import Resoluble from './resoluble';
import Entity from '../../entities/entity';
import Field from '../../entities/field';
import TurnContext from '../../contexts/turncontext';
import SerializedProperty from '../../utils/serializedproperty';
import Death from './death';

export default class Damage extends Resoluble {
    private source: Entity;
    private target: Entity;
    private base_amount: number;
    private total_amount: number;

    constructor(source: Entity, target: Entity, amount: number) {
        super();

        this.source = source;
        this.target = target;
        this.base_amount = amount;

        this.type = 'Damage';
    }

    /**
     * Damages an entity
     */
    public resolve(field: Field, turn_context: TurnContext): void {
        this.total_amount = this.base_amount;

        if (!this.target.combat.alive) {
            this.total_amount = 0;
        } else {
            if ((this.target.combat.current_health - this.total_amount) < 0) {
                this.total_amount = this.target.combat.current_health;
            }
        }

        this.target.combat.current_health -= this.total_amount;

        if (this.target.combat.current_health <= 0.0) {
            turn_context.add_direct_resoluble(new Death(this.target), true);
        }

        this.resolved = true;
    }

    public toJSON(): any {
        const json: any = super.toJSON();

        json.source = new SerializedProperty('Entity', this.source.key);
        json.target = new SerializedProperty('Entity', this.target.key);
        json.base_amount = this.base_amount;

        return json;
    }

    public static fromJSON(json: any): Damage {
        const obj: Damage = new Damage(json.source, json.target, json.amount);

        return obj;
    }
}