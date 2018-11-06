export default class StringExtensions {
    public static to_readable_percentage(value: number): string {
        return Math.round(value * 100) + '%';
    }
}