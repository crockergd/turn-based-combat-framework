
import StatInfo from '../entities/statinfo';

export const DEFAULT_STAT_INFO: StatInfo = {
    level: 1,
    previous_experience: 0,
    current_experience: 0,
    required_experience: 100,
    speed: 50,
    strength: 25,
    vitality: 100,
    intelligence: 25,
    dexterity: 25
};

export const DEFAULT_CRITICAL_MULTIPLIER: number = 1.5;
export const DEFAULT_ANIMATION: string = 'DEFAULT_ANIMATION';
export const DEFAULT_RECRUITMENT_SLOTS: number = 4;
export const DEFAULT_CLASS_KEYS: Array<string> = [
    'bandit',
    'cleric',
    'knight'
];

export const SPEED_CAP: number = 100;

export const MAX_SPELLS: number = 4;
export const MAX_SHOP_ITEMS: number = 4;
export const MAX_RECRUITS: number = 3;
export const MAX_SPELL_RANK: number = 2;
export const MAX_DISPLAYABLE_STATUSES: number = 5;
export const MAX_RECRUITMENT_SLOTS: number = 8;

export const BASE_EXP_REQ: number = 100;
export const BASE_CLASS_EXP_REQ: number = 50;
export const CLASS_EXP_MOD: number = 0.10;

export const GREEN_FILL: string = '#83f442';
export const RED_FILL: string = '#ff0000';
export const BLUE_FILL: string = '#0000ff';

export const TEXT_CLEARED: string = 'Cleared';
export const LINE_BREAK: string = '\n';

export const ARMOR_LOWER_LIMIT: number = 50;
export const ARMOR_UPPER_LIMIT: number = 150;