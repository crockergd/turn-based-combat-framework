import Resoluble from './resoluble';
import Entity from '../../entities/entity';

enum Operation {
    ADDITION,
    SUBSTRACTION,
    MULTIPLICATION,
    DIVISION
}

export default class ModifyProperty extends Resoluble {
    private target: Entity;
    private amount: number;
    private operation: Operation;
    private property_chain: Array<string>;
    private target_object: any;
    private target_property: any;

    constructor(target: Entity, amount: number, operation: any, ...property_chain: Array<string>) {
        super();

        this.target = target;
        this.amount = amount;
        this.operation = operation;
        this.property_chain = property_chain;

        this.type = 'ModifyProperty';
    }

    public resolve(): void {
        this.target_object = this.target;
        const mutable_property_chain: Array<string> = this.property_chain.slice();
        this.target_property = mutable_property_chain.pop();

        for (const property of mutable_property_chain) {
            this.target_object = this.target_object[property];
        }

        // if (!this.target_property || typeof this.target_property !== 'number') return;
        
        this.resolve_operation();

        this.resolved = true;
    }

    private resolve_operation(): void {
        switch (this.operation) {
            case Operation.ADDITION:
                this.target_object[this.target_property] += this.amount;
                break;

            case Operation.SUBSTRACTION:
                this.target_object[this.target_property] -= this.amount;
                break;

            case Operation.MULTIPLICATION:
                this.target_object[this.target_property] *= this.amount;
                break;

            case Operation.DIVISION:
                this.target_object[this.target_property] /= this.amount;
                break;
        }
    }

    public undo(): void {
        if (!this.resolved) return;

        switch (this.operation) {
            case Operation.ADDITION:
                this.target_object[this.target_property] -= this.amount;
                break;

            case Operation.SUBSTRACTION:
                this.target_object[this.target_property] += this.amount;
                break;

            case Operation.MULTIPLICATION:
                this.target_object[this.target_property] /= this.amount;
                break;

            case Operation.DIVISION:
                this.target_object[this.target_property] *= this.amount;
                break;
        }
    }

    public toJSON(): any {
        const json: any = super.toJSON();

        json.target = this.target.key;
        json.amount = this.amount;
        json.operation = this.operation;
        json.property_chain = this.property_chain;

        return json;
    }
}