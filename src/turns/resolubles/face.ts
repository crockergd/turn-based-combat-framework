import Resoluble from './resoluble';
import Entity from '../../entities/entity';
import Vector from '../../utils/vector';
import SerializedProperty from '../../utils/serializedproperty';

export default class Face extends Resoluble {
    constructor(readonly source: Entity, readonly facing: Vector) {
        super();

        this.type = 'Face';
    }

    public resolve(): void {
        if (!this.source.alive) return;

        this.source.spatial.facing.x = this.facing.x;
        this.source.spatial.facing.y = this.facing.y;

        // this.source.set('dirty', true);
    }

    public toJSON(): any {
        const json: any = super.toJSON();

        json.source = new SerializedProperty('Entity', this.source.key);
        json.facing = this.facing;

        return json;
    }

    public static fromJSON(json: any): Face {
        const obj: Face = new Face(json.source, json.facing);

        return obj;
    }
}