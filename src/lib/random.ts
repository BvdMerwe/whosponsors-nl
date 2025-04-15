export default class Random {
    public static randomBetween(min: number = 50, max: number = 200): number {
        return Math.floor(Math.random() * (max - min) + min);
    }
}
