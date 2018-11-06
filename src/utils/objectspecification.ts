import { ObjectSpecificationTarget } from './objectspecificationtarget';
import ObjectSpecificationOperation from './objectspecificationoperation';

export default class ObjectSpecification {
    public target: ObjectSpecificationTarget;
    public specifier: string;
    public operation: ObjectSpecificationOperation;
    public relation?: number;

    constructor(target: ObjectSpecificationTarget, specifier: string, operation: ObjectSpecificationOperation, relation?: number) {
        this.target = target;
        this.specifier = specifier;
        this.operation = operation;
        this.relation = relation;
    }
}