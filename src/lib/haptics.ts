/**
 * Haptic Feedback Layer
 * Provides smooth, context-aware vibration patterns
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'pulse' | 'double' | 'triple';

const PATTERNS: Record<HapticPattern, number | number[]> = {
    light: 10,
    medium: 25,
    heavy: 50,
    success: [10, 30, 10],
    warning: [20, 50, 20, 50, 20],
    error: [50, 100, 50],
    pulse: [10, 20, 10, 20, 10],
    double: [15, 50, 15],
    triple: [10, 40, 10, 40, 10],
};

class HapticFeedback {
    private isSupported: boolean;

    constructor() {
        this.isSupported = 'vibrate' in navigator;
    }

    /**
     * Check if haptic feedback is available
     */
    canVibrate(): boolean {
        return this.isSupported;
    }

    /**
     * Trigger a haptic pattern
     */
    trigger(pattern: HapticPattern = 'light'): void {
        if (!this.isSupported) return;

        const vibration = PATTERNS[pattern];
        navigator.vibrate(vibration);
    }

    /**
     * Stop any ongoing vibration
     */
    cancel(): void {
        if (!this.isSupported) return;
        navigator.vibrate(0);
    }

    // Semantic haptics for specific actions

    /** Light tap for UI interactions */
    tap(): void {
        this.trigger('light');
    }

    /** Success feedback for completed actions */
    success(): void {
        this.trigger('success');
    }

    /** Warning feedback for important notices */
    warning(): void {
        this.trigger('warning');
    }

    /** Error feedback for failed actions */
    error(): void {
        this.trigger('error');
    }

    /** Notification pulse for incoming messages */
    notification(): void {
        this.trigger('double');
    }

    /** Entry pulse when crossing geofence */
    entry(): void {
        this.trigger('triple');
    }

    /** Pounce notification - friendly bounce */
    pounce(): void {
        this.trigger('pulse');
    }

    /** Heavy impact for critical actions */
    impact(): void {
        this.trigger('heavy');
    }
}

// Export singleton instance
export const haptics = new HapticFeedback();
