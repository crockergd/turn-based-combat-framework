import { ObjectSpecificationOperationType } from './objectspecificationoperationtype';

export default interface ObjectSpecificationOperation {
    type: ObjectSpecificationOperationType;
    arg: number;
}