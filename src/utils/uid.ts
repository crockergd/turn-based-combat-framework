let uid: number = 0;
export default abstract class UID {
    
    /**
     * Returns a unique identifier for a given execution of the application. 
     * WARNING: This identifier is not guaranteed to be the same between executions, don't serialize keys made with this generator.
     * 
     * @param prefix Prefix to append to uid.
     */
    public static next(prefix?: string): string {
        let next_uid: string = (uid++).toString();
        if (prefix) next_uid = prefix + '-' + next_uid;
        return next_uid.toLowerCase();
    }
}