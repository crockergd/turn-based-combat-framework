import Entity from "./entity";

export default interface ThreatInfo {
    targets: Array<[Entity, number]>;
}