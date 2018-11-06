import Resoluble from './resolubles/resoluble';

export default class Status {
    key: string; // unique identifier across a single execution
    targetting_key?: string; // unique identifier across multiple executions
    name_key?: string; // non-unique identifier
    applicator_targetting_key: string;
    remaining: number;
    application_resoluble?: Resoluble;
    tickable_resoluble?: Resoluble;
    expiration_resoluble?: Resoluble;

    name?: string;
    icon?: string;
    description?: string;

    damage?: number;
}