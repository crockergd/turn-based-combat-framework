import BaseEntity from "./baseentity";

export default interface ThreatInfo {
    targets: Array<[BaseEntity, number]>;
}