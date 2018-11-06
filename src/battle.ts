import TurnContext from './contexts/turncontext';
import Field from './entities/field';
import BaseEntity from './entities/baseentity';
import TickMode from './turns/tickmode';

export default class Battle {
    private field: Field;
    private turn_context: TurnContext;

    constructor(tick_mode?: TickMode) {
        this.field = new Field();

        this.turn_context = new TurnContext(this.field, tick_mode);
    }    

    public add_entity(entity: BaseEntity): void {


        this.field.add_entity(entity);
    }

    public update(dt: number): void {
        this.turn_context.update(dt);
    }
}