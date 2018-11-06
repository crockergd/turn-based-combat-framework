import Field from '../../entities/field';

export default abstract class Resoluble { 
    protected resolved: boolean;
    protected silenced: boolean;
    public chained: boolean;
    public type: string;
    public tags: Array<string>;
    
    public index?: number;
    public abstract resolve(field: Field, turn_context: any, render_context: any, data_context: any, hook_context?: any): void;
    public abstract undo(): void;    

    constructor() {
        this.resolved = false;
        this.silenced = false;
        this.chained = false;
        this.tags = new Array<string>();

        this.type = 'Resoluble';
    }

    /**
     * Disallows the resoluble from rendering text
     */
    public silence(): void {
        this.silenced = true;
    }

    public flag_chained(): void {
        this.chained = true;
    }

    public toJSON(): any {
        let json: any = {
            index: this.index,
            silenced: this.silenced,
            type: this.type,
            tags: this.tags
        };

        return json;
    }
}