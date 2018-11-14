import Turn from '../turns/turn';

/**
 * Helper class to encapsulate a turn
 */
export default class TickCallbackContext {
    public callback: (turn: Turn) => any;
    public context: any;

    public constructor(callback: (turn: Turn) => any, context: any) {
        this.callback = callback;
        this.context = context;
    }
}