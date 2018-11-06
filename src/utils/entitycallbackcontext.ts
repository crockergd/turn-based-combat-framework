import BaseEntity from '../entities/baseentity';

/**
 * Helper class to encapsulate an entity callback + context
 */
export default class EntityCallbackContext {
    public callback: (entity: BaseEntity, partial: boolean) => any;
    public context: any;
    public priority: number;

    public constructor(callback: (entity: BaseEntity, partial: boolean) => any, context: any, priority: number) {
        this.callback = callback;
        this.context = context;
        this.priority = priority;
    }

    public static compare(lhs: EntityCallbackContext, rhs: EntityCallbackContext): number {
        if (lhs.priority > rhs.priority) {
            return 1;
        } else if (lhs.priority < rhs.priority) {
            return -1;
        } else {
            return 0;
        }
    }
}