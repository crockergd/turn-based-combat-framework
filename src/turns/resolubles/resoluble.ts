import Field from '../../entities/field';

export default abstract class Resoluble {
    protected resolved: boolean;
    protected silenced: boolean;
    public active: boolean;
    public chained: boolean;
    public type: string;
    public tags: Array<string>;
    public priority: number;
    public timestamp: number;

    public index?: number;
    public abstract resolve(field: Field, turn_context: any, render_context: any, hook_context?: any): void;

    constructor() {
        this.resolved = false;
        this.silenced = false;
        this.active = true;
        this.chained = false;
        this.tags = new Array<string>();

        this.priority = 0;
        this.timestamp = Date.now();

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