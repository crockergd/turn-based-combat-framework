import Status from '../turns/status';

export default interface BattleInfo {
    alive: boolean;
    current_health: number;
    current_mana: number;
    combat_speed: number;
    global_armor_mod: number;
    global_damage_mod: number;
    global_healing_mod: number;
    global_threat_mod: number;
    statuses: Array<Status>;
    spell_keys: Array<string>;    
    artifact_keys: Array<string>;
    spell_grading: Array<string>;
}