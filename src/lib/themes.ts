/**
 * Dynamic Theme System
 * Provides preset themes for different event vibes
 */

export type ThemeId = 'default' | 'networking' | 'concert' | 'market' | 'wellness' | 'nightlife' | 'sport';

export interface Theme {
    id: ThemeId;
    name: string;
    emoji: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        glow: string;
    };
    cssVariables: Record<string, string>;
}

export const THEMES: Record<ThemeId, Theme> = {
    default: {
        id: 'default',
        name: 'Adey Default',
        emoji: '✨',
        description: 'The classic Adey look',
        colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            accent: '#a855f7',
            glow: 'rgba(99, 102, 241, 0.5)',
        },
        cssVariables: {
            '--space-blue': '239 84% 67%',
            '--space-purple': '258 90% 66%',
            '--space-violet': '271 91% 65%',
            '--broadcast': '45 93% 58%',
        },
    },
    networking: {
        id: 'networking',
        name: 'Networking Blue',
        emoji: '💼',
        description: 'Professional & sleek',
        colors: {
            primary: '#0ea5e9',
            secondary: '#0284c7',
            accent: '#38bdf8',
            glow: 'rgba(14, 165, 233, 0.5)',
        },
        cssVariables: {
            '--space-blue': '199 89% 48%',
            '--space-purple': '200 98% 39%',
            '--space-violet': '198 93% 60%',
            '--broadcast': '38 92% 50%',
        },
    },
    concert: {
        id: 'concert',
        name: 'Concert Neon',
        emoji: '🎸',
        description: 'Electric & vibrant',
        colors: {
            primary: '#f43f5e',
            secondary: '#e11d48',
            accent: '#fb7185',
            glow: 'rgba(244, 63, 94, 0.5)',
        },
        cssVariables: {
            '--space-blue': '350 89% 60%',
            '--space-purple': '350 83% 60%',
            '--space-violet': '347 77% 70%',
            '--broadcast': '280 100% 70%',
        },
    },
    market: {
        id: 'market',
        name: 'Market Green',
        emoji: '🌿',
        description: 'Fresh & organic',
        colors: {
            primary: '#22c55e',
            secondary: '#16a34a',
            accent: '#4ade80',
            glow: 'rgba(34, 197, 94, 0.5)',
        },
        cssVariables: {
            '--space-blue': '142 71% 45%',
            '--space-purple': '142 76% 36%',
            '--space-violet': '142 69% 58%',
            '--broadcast': '45 93% 47%',
        },
    },
    wellness: {
        id: 'wellness',
        name: 'Wellness Calm',
        emoji: '🧘',
        description: 'Peaceful & serene',
        colors: {
            primary: '#14b8a6',
            secondary: '#0d9488',
            accent: '#2dd4bf',
            glow: 'rgba(20, 184, 166, 0.5)',
        },
        cssVariables: {
            '--space-blue': '168 76% 42%',
            '--space-purple': '168 84% 32%',
            '--space-violet': '168 64% 51%',
            '--broadcast': '199 89% 48%',
        },
    },
    nightlife: {
        id: 'nightlife',
        name: 'Nightlife Glow',
        emoji: '🌃',
        description: 'Dark & electric',
        colors: {
            primary: '#a855f7',
            secondary: '#9333ea',
            accent: '#c084fc',
            glow: 'rgba(168, 85, 247, 0.5)',
        },
        cssVariables: {
            '--space-blue': '271 91% 65%',
            '--space-purple': '270 95% 56%',
            '--space-violet': '270 80% 75%',
            '--broadcast': '340 82% 52%',
        },
    },
    sport: {
        id: 'sport',
        name: 'Sport Energy',
        emoji: '⚡',
        description: 'Bold & energetic',
        colors: {
            primary: '#f97316',
            secondary: '#ea580c',
            accent: '#fb923c',
            glow: 'rgba(249, 115, 22, 0.5)',
        },
        cssVariables: {
            '--space-blue': '25 95% 53%',
            '--space-purple': '21 90% 48%',
            '--space-violet': '27 96% 61%',
            '--broadcast': '47 96% 53%',
        },
    },
};

/**
 * Apply a theme to the document
 */
export function applyTheme(themeId: ThemeId): void {
    const theme = THEMES[themeId];
    if (!theme) return;

    const root = document.documentElement;

    Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });

    // Store preference
    localStorage.setItem('adey-theme', themeId);
}

/**
 * Get the current theme from localStorage
 */
export function getCurrentTheme(): ThemeId {
    const stored = localStorage.getItem('adey-theme');
    if (stored && stored in THEMES) {
        return stored as ThemeId;
    }
    return 'default';
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
    const theme = getCurrentTheme();
    applyTheme(theme);
}
