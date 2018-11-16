import Entity from '../entities/entity';

export default class Vector {
    public x: number;
    public y: number;
    public z?: number;

    constructor(x: number, y: number, z?: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public static create_from_entity(entity: Entity): Vector {
        return new Vector(entity.spatial.position.x, entity.spatial.position.y, entity.spatial.position.z);
    }

    public static create_from_vector(vector: Vector): Vector {
        return new Vector(vector.x, vector.y, vector.z);
    }
}