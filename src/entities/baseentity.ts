import IdentifierInfo from './identifierinfo';
import StatInfo from './statinfo';
import RenderableInfo from './renderableinfo';
import TemporalInfo from './temporalinfo';
import ThreatInfo from './threatinfo';
import BattleInfo from './battleinfo';
import Team from './team';

import Spell from '../spells/spell';
import * as Constants from '../utils/constants';
import TargetSpecification from '../turns/targets/targetspecification';
import UID from '../utils/uid';
import Status from '../turns/status';

export default abstract class BaseEntity {
    // public controllable: Controllable;
    public spells: Map<string, Spell>;

    public identifier_info: IdentifierInfo;
    public stat_info: StatInfo;
    public battle_info: BattleInfo;

    public renderable_info: RenderableInfo;
    public temporal_info: TemporalInfo;
    public threat_info: ThreatInfo;

    public key: string;
    public targetting_key: string;
    public priority: number;

    public active_spell: Spell;
    public active_target: TargetSpecification;

    private level_scaling: StatInfo;

    public speed_required: number;
    public team: Team;

    constructor() {

    }

    // constructor(identifier_info: IdentifierInfo, stat_info: StatInfo, level_scaling: StatInfo, battle_info?: BattleInfo) {
    //     this.identifier_info = identifier_info;
    //     this.stat_info = stat_info;
    //     this.level_scaling = level_scaling;
    //     this.battle_info = battle_info;

    //     this.key = UID.next(this.name);
    //     this.temporal_info = new TemporalInfo();
    //     this.spells = new Map<string, Spell>();

    //     this.reset_combat_properties();
    // }

    // get name(): string {
    //     return this.identifier_info.name;
    // }

    // get class_name(): string {
    //     return this.identifier_info.class_name;
    // }

    // get sprite_key(): string {
    //     return this.identifier_info.sprite_key;
    // }

    // get class_key(): string {
    //     return this.identifier_info.class_key;
    // }

    // get class_tags(): Array<string> {
    //     return this.identifier_info.class_tags;
    // }

    // get team(): Team {
    //     return this.identifier_info.team;
    // }

    // get position(): Point {
    //     return this.renderable_info.group.position;
    // }

    // get height(): number {
    //     return this.renderable_info.sprite.height;
    // }

    // get width(): number {
    //     return this.renderable_info.sprite.width;
    // }

    // get maximum_health(): number {
    //     return this.stat_info.vitality;
    // }

    // get maximum_mana(): number {
    //     return 100;
    // }

    // get experience_percentage(): number {
    //     return (this.stat_info.current_experience - this.stat_info.previous_experience) / (this.stat_info.required_experience - this.stat_info.previous_experience);
    // }

    // get speed_required(): number {
    //     return (this.temporal_info.speed_cap - this.temporal_info.current_speed) / this.battle_info.combat_speed;
    // }

    // get armor(): number {
    //     let armor: number = Math.max(Constants.ARMOR_LOWER_LIMIT, Math.min(Constants.ARMOR_UPPER_LIMIT, this.battle_info.global_armor_mod));
    //     armor /= 100;

    //     if (armor > 1) {
    //         armor -= (armor - 1) * 2;
    //     } else {
    //         armor += (1 - armor) * 2;
    //     }

    //     return armor;
    // }

    // get attack_damage(): number {
    //     return this.stat_info.strength * this.battle_info.global_damage_mod;
    // }

    // get spell_damage(): number {
    //     return this.stat_info.intelligence * this.battle_info.global_damage_mod;
    // }

    // get heal_power(): number {
    //     return this.stat_info.intelligence * this.battle_info.global_healing_mod;
    // }

    // get critical_chance(): number {
    //     return (this.stat_info.dexterity / 5) / 100;
    // }

    // get critical_multiplier(): number {
    //     return Constants.DEFAULT_CRITICAL_MULTIPLIER;
    // }

    // get relative_power(): number {
    //     const speed_multiplier: number = this.stat_info.speed / Constants.SPEED_CAP;
    //     const upper_damage_constant: number = Math.max(this.attack_damage, this.spell_damage);
    //     const critical_additive: number = (upper_damage_constant * this.critical_multiplier) * this.critical_chance;
    //     const relative_damage: number = upper_damage_constant + critical_additive;
    //     return relative_damage * speed_multiplier;
    // }

    // get health_string_formatted(): string {
    //     if (this.battle_info.alive) return Math.round(this.battle_info.current_health) + ' / ' + Math.round(this.maximum_health);
    //     else return 'DEAD';
    // }

    // get mana_string_formatted(): string {
    //     if (this.battle_info.alive) return Math.round(this.battle_info.current_mana) + ' / ' + Math.round(this.maximum_mana);
    //     else return '';
    // }

    // get speed_string_formatted(): string {
    //     if (this.battle_info.alive) return Math.round(this.temporal_info.current_speed) + ' / ' + Math.round(this.temporal_info.speed_cap);
    //     else return '';
    // }

    // get artifact_keys(): Array<string> {
    //     return this.battle_info.artifact_keys;
    // }

    // get statuses(): Array<RenderableStatusInfo> {
    //     const statuses: Array<RenderableStatusInfo> = Status.to_renderables(this.battle_info.statuses).reduce((acc, val) => { 
    //         const parent_element: RenderableStatusInfo = acc.find(status => (status.entity_key === val.entity_key)
    //             && (status.key === val.key));
            
    //         if (parent_element) {
    //             if (parent_element.damage || parent_element.damage === 0) parent_element.damage += val.damage;
    //             parent_element.remaining = Math.max(parent_element.remaining, val.remaining);   
                
    //             return acc;
    //         } else {
    //             return acc.concat(val);
    //         }             
    //     }, []);

    //     return statuses;
    // }

    // public get_spell_rank(spell_key: string): number {
    //     return Math.min(this.battle_info.spell_grading.filter(spell_grade_key => spell_grade_key === spell_key).length, Constants.MAX_SPELL_RANK);
    // }

    // public has_spell_key(spell_key: string): boolean {
    //     if (this.battle_info.spell_keys.find(inner_spell_key => inner_spell_key === spell_key)) return true;
    //     return false;
    // }

    // public add_spell_key(spell_key: string, index?: number): void {
    //     if (this.has_spell_key(spell_key)) {
    //         this.battle_info.spell_grading.push(spell_key);
    //         return;
    //     }

    //     if ((index || index === 0) && this.battle_info.spell_keys.length > index) {
    //         const replacement_key: string = this.battle_info.spell_keys[index];
    //         this.battle_info.spell_keys = this.battle_info.spell_keys.filter(inner_spell_key => inner_spell_key !== replacement_key);
    //         this.battle_info.spell_keys.splice(index, 0, spell_key);
    //     } else {
    //         this.battle_info.spell_keys.push(spell_key);
    //     }
    // }

    // public set_spell_keys(spell_keys: Array<string>): void {
    //     this.battle_info.spell_keys = spell_keys.slice();
    // }

    // public set_artifact_keys(artifact_keys: Array<string>): void {
    //     this.battle_info.artifact_keys = artifact_keys.slice();
    // }

    // public reset_combat_properties(reset_resources?: boolean): void {
    //     if (!this.battle_info) {
    //         this.battle_info = {
    //             alive: true,
    //             current_health: this.maximum_health,
    //             current_mana: this.maximum_mana,
    //             combat_speed: this.stat_info.speed,
    //             global_armor_mod: 100,
    //             global_damage_mod: 1.0,
    //             global_healing_mod: 1.0,
    //             global_threat_mod: 1.0,
    //             statuses: new Array<Status>(),
    //             spell_keys: null,
    //             artifact_keys: new Array<string>(),
    //             spell_grading: new Array<string>()
    //         };
    //     } else {
    //         this.battle_info.combat_speed = this.stat_info.speed;
    //         this.battle_info.global_damage_mod = 1.0;
    //         this.battle_info.global_healing_mod = 1.0;
    //         this.battle_info.global_armor_mod = 100;
    //         this.battle_info.global_threat_mod = 1.0;
    //         this.battle_info.statuses = new Array<Status>();

    //         if (reset_resources) {
    //             this.battle_info.alive = true;
    //             this.battle_info.current_health = this.maximum_health;
    //             this.battle_info.current_mana = this.maximum_mana;
    //         }
    //     }

    //     this.reset_temporal_info();
    // }

    // public reset_temporal_info(): void {
    //     this.temporal_info.action_queued = false;
    //     this.temporal_info.current_speed = 0.0;
    //     this.temporal_info.speed_cap = Constants.SPEED_CAP;
    //     this.active_spell = null;
    //     this.active_target = null;
    // }

    // public update(dt: number): boolean {
    //     if (!this.battle_info.alive) return false;

    //     let variance: number = 1; // Math.random() * (1.25 - 0.75) + 0.75;
    //     let speed_tick: number = (this.battle_info.combat_speed * dt) * variance;
    //     this.temporal_info.current_speed += speed_tick;

    //     return (this.temporal_info.current_speed >= this.temporal_info.speed_cap) && !this.temporal_info.action_queued; // determine if entity can act
    // }

    // public check_mana_cost(mana_cost: number): boolean {
    //     return this.battle_info.current_mana >= mana_cost;
    // }

    // /**
    //  * Award character and class experience
    //  */
    // public award_experience(exp: number): Array<LevelUpInfo> {
    //     let levels: Array<LevelUpInfo> = new Array<LevelUpInfo>();

    //     let pre_level_exp: number = this.stat_info.current_experience;
    //     this.stat_info.current_experience += exp;
    //     while (this.stat_info.current_experience >= this.stat_info.required_experience) {
    //         levels.push(this.award_base_level(pre_level_exp));
    //     }

    //     return levels;
    // }

    // private award_base_level(pre_level_exp: number): LevelUpInfo {
    //     const pre_level_health: number = this.maximum_health;
    //     Entity.apply_level(this.stat_info, this.level_scaling);
    //     const added_health: number = this.maximum_health - pre_level_health;

    //     this.stat_info.level++;
    //     this.stat_info.previous_experience = this.stat_info.required_experience;
    //     this.stat_info.required_experience += Constants.BASE_EXP_REQ * (this.stat_info.level / 10 + 1);

    //     if (this.battle_info.alive) this.battle_info.current_health += added_health;

    //     return {
    //         base: true,
    //         level: this.stat_info.level,
    //         previous_required_exp: this.stat_info.previous_experience,
    //         pre_level_exp: pre_level_exp,
    //         next_required_exp: this.stat_info.required_experience
    //     };
    // }

    /**
     * Determine how much exp entity will award when slain
     */
    // public calculate_slain_exp(): number {
    //     return this.stat_info.level * 30;
    // }

    /**
     * Attach a controllable to an entity, flagging it an AI unit
     */
    // public attach_controllable(controllable: Controllable): void {
    //     controllable.entity = this;
    //     this.controllable = controllable;
    // }

    /**
     * Returns info to persist in json when saving
     */
    // public toJSON(): any {
    //     let json: any = {
    //         type: 'Entity',
    //         targetting_key: this.targetting_key,
    //         identifier_info: this.identifier_info,
    //         stat_info: this.stat_info,
    //         level_scaling: this.level_scaling,
    //         battle_info: this.battle_info
    //     };

    //     return json;
    // }

    /**
     * Creates an entity stat sheet
     * 
     * @param level - Desired level of the entity, a generic measurement of power
     * @param stat_scaling - Scaling factors for individual stats, determined by the entity type
     */
    // public static generate_stat_info(level: number, stat_scaling: StatInfo, level_scaling: StatInfo): StatInfo {
    //     let stat_info: StatInfo = {
    //         level: level,
    //         previous_experience: 0,
    //         current_experience: 0,
    //         required_experience: 100,
    //         speed: Math.round(Constants.DEFAULT_STAT_INFO.speed * stat_scaling.speed),
    //         strength: Math.round((Constants.DEFAULT_STAT_INFO.strength) * stat_scaling.strength),
    //         vitality: Math.round((Constants.DEFAULT_STAT_INFO.vitality) * stat_scaling.vitality),
    //         intelligence: Math.round((Constants.DEFAULT_STAT_INFO.intelligence) * stat_scaling.intelligence),
    //         dexterity: Math.round((Constants.DEFAULT_STAT_INFO.dexterity) * stat_scaling.dexterity)
    //     };

    //     for (let i: number = 0; i < level - 1; i++) {
    //         BaseEntity.apply_level(stat_info, level_scaling);
    //     }

    //     return stat_info;
    // }

    // public static apply_level(stat_info: StatInfo, level_scaling: StatInfo): void {
    //     stat_info.vitality *= level_scaling.vitality;
    //     stat_info.strength *= level_scaling.strength;
    //     stat_info.intelligence *= level_scaling.intelligence;
    //     stat_info.dexterity *= level_scaling.dexterity;
    // }
}