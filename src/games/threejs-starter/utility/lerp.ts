export const ease = {
    linear: (t: number): number => t,
    quadraticIn: (t: number): number => t * t,
    quadraticOut: (t: number): number => t * (2 - t),
    quadraticInOut: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    cubicIn: (t: number): number => t * t * t,
    cubicOut: (t: number): number => (--t) * t * t + 1,
    cubicInOut: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    quarticIn: (t: number): number => t * t * t * t,
    quarticOut: (t: number): number => 1 - (--t) * t * t * t,
    quarticInOut: (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
    quinticIn: (t: number): number => t * t * t * t * t,
    quinticOut: (t: number): number => 1 + (--t) * t * t * t * t,
    quinticInOut: (t: number): number => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
    sineIn: (t: number): number => 1 - Math.cos(t * Math.PI / 2),
    sineOut: (t: number): number => Math.sin(t * Math.PI / 2),
    sineInOut: (t: number): number => -0.5 * (Math.cos(Math.PI * t) - 1),
    circularIn: (t: number): number => 1 - Math.sqrt(1 - t * t),
    circularOut: (t: number): number => Math.sqrt(1 - (--t) * t),
    circularInOut: (t: number): number => t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2,
    exponentialIn: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    exponentialOut: (t: number): number => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
    exponentialInOut: (t: number): number => t === 0 || t === 1 ? t : t < 0.5 ? 0.5 * Math.pow(2, 20 * t - 10) : 0.5 * (-Math.pow(2, -20 * t + 10) + 2),
    elasticIn: (t: number): number => -Math.pow(2, 10 * (t -= 1)) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3),
    elasticOut: (t: number): number => Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1,
    elasticInOut: (t: number): number => t < 0.5 ? -0.5 * Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 0.45) : 0.5 * Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * (2 * Math.PI) / 0.45) + 1,
    backIn: (t: number): number => t * t * (2.70158 * t - 1.70158),
    backOut: (t: number): number => --t * t * (2.70158 * t + 1.70158) + 1,
    backInOut: (t: number): number => t < 0.5 ? t * t * (7 * t - 2.5) : --t * t * (7 * t + 2.5) + 1,
    bounceIn: (t: number): number => 1 - ease.bounceOut(1 - t),
    bounceOut: (t: number): number => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },

    bounceInOut: (t: number): number => t < 0.5 ? 0.5 * ease.bounceIn(t * 2) : 0.5 * ease.bounceOut(t * 2 - 1),
}

export function lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
}
export async function tween(
    start: number,
    end: number,
    steps: number,
    callback: (value: number) => void,
    easetype?: (x: number) => number
): Promise<number> {
    return new Promise((resolve) => {
        easetype ||= ease.linear;
        const duration = 100 * steps; // Duration in milliseconds

        let startTime: number | null = null;

        const runAnimation = (currentTime: number) => {
            if (!startTime) {
                startTime = currentTime;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easetype!(progress);
            const value = lerp(start, end, easedProgress);

            callback(value);

            if (progress < 1) {
                requestAnimationFrame(runAnimation);
            } else {
                // Ensure the final value is set to the end value
                callback(end);
                resolve(end);
            }
        };

        requestAnimationFrame(runAnimation);
    });
}
