import Team from './team';

export default interface IdentifierInfo {
    name: string;
    sprite_key: string;
    class_key: string;
    class_tags: Array<string>;
    class_name: string;
    team: Team
}