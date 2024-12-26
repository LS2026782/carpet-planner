import { EventEmitter } from './EventEmitter';

export type ThemeName = 'default' | 'high-contrast' | 'dark' | 'light';
export type ColorSchemePreference = 'light' | 'dark' | 'no-preference';
export type ContrastPreference = 'no-preference' | 'high' | 'low';

interface ThemeEvents {
    themeChange: ThemeName;
    contrastChange: ContrastPreference;
    colorSchemeChange: ColorSchemePreference;
}

interface ThemeManagerOptions {
    defaultTheme?: ThemeName;
    respectSystemPreferences?: boolean;
    persistPreferences?: boolean;
    storageKey?: string;
}

/**
 * Manages theme switching and system preferences
 */
export class ThemeManager extends EventEmitter<ThemeEvents> {
    private currentTheme: ThemeName;
    private options: Required<ThemeManagerOptions>;
    private mediaQueries: {
        darkMode: MediaQueryList;
        highContrast: MediaQueryList;
        reducedMotion: MediaQueryList;
    };

    constructor(options: ThemeManagerOptions = {}) {
        super();

        this.options = {
            defaultTheme: options.defaultTheme || 'default',
            respectSystemPreferences: options.respectSystemPreferences ?? true,
            persistPreferences: options.persistPreferences ?? true,
            storageKey: options.storageKey || 'theme-preferences'
        };

        // Initialize media queries
        this.mediaQueries = {
            darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
            highContrast: window.matchMedia('(forced-colors: active)'),
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
        };

        // Load saved preferences or use system preferences
        this.currentTheme = this.loadPreferences();

        // Set up system preference listeners
        this.setupSystemPreferenceListeners();

        // Apply initial theme
        this.applyTheme(this.currentTheme);
    }

    /**
     * Gets the current theme
     */
    getCurrentTheme(): ThemeName {
        return this.currentTheme;
    }

    /**
     * Sets the current theme
     */
    setTheme(theme: ThemeName): void {
        if (theme !== this.currentTheme) {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.savePreferences();
            this.emit('themeChange', theme);
        }
    }

    /**
     * Gets the system color scheme preference
     */
    getSystemColorScheme(): ColorSchemePreference {
        if (this.mediaQueries.darkMode.matches) {
            return 'dark';
        }
        if (this.mediaQueries.darkMode.media === 'not all') {
            return 'no-preference';
        }
        return 'light';
    }

    /**
     * Gets the system contrast preference
     */
    getSystemContrastPreference(): ContrastPreference {
        if (this.mediaQueries.highContrast.matches) {
            return 'high';
        }
        return 'no-preference';
    }

    /**
     * Checks if reduced motion is preferred
     */
    isReducedMotionPreferred(): boolean {
        return this.mediaQueries.reducedMotion.matches;
    }

    /**
     * Applies the specified theme
     */
    private applyTheme(theme: ThemeName): void {
        // Remove existing theme
        document.documentElement.classList.remove('theme-default', 'theme-high-contrast', 'theme-dark', 'theme-light');
        
        // Apply new theme
        document.documentElement.classList.add(`theme-${theme}`);
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', this.getThemeColor(theme));
        }

        // Announce theme change to screen readers
        this.announceThemeChange(theme);
    }

    /**
     * Gets the theme color for meta tag
     */
    private getThemeColor(theme: ThemeName): string {
        switch (theme) {
            case 'dark':
                return '#1a1a1a';
            case 'high-contrast':
                return '#000000';
            case 'light':
                return '#ffffff';
            default:
                return '#ffffff';
        }
    }

    /**
     * Announces theme change to screen readers
     */
    private announceThemeChange(theme: ThemeName): void {
        const announcement = `Theme changed to ${theme.replace('-', ' ')}`;
        const announcer = document.createElement('div');
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'polite');
        announcer.textContent = announcement;
        document.body.appendChild(announcer);
        setTimeout(() => announcer.remove(), 1000);
    }

    /**
     * Sets up system preference change listeners
     */
    private setupSystemPreferenceListeners(): void {
        if (this.options.respectSystemPreferences) {
            // Dark mode changes
            this.mediaQueries.darkMode.addEventListener('change', (e) => {
                const preference: ColorSchemePreference = e.matches ? 'dark' : 'light';
                this.emit('colorSchemeChange', preference);
                if (this.options.respectSystemPreferences) {
                    this.setTheme(preference === 'dark' ? 'dark' : 'light');
                }
            });

            // High contrast changes
            this.mediaQueries.highContrast.addEventListener('change', (e) => {
                const preference: ContrastPreference = e.matches ? 'high' : 'no-preference';
                this.emit('contrastChange', preference);
                if (this.options.respectSystemPreferences && e.matches) {
                    this.setTheme('high-contrast');
                }
            });
        }
    }

    /**
     * Loads saved preferences
     */
    private loadPreferences(): ThemeName {
        if (this.options.persistPreferences) {
            try {
                const saved = localStorage.getItem(this.options.storageKey);
                if (saved) {
                    const preferences = JSON.parse(saved);
                    return preferences.theme || this.options.defaultTheme;
                }
            } catch (error) {
                console.warn('Failed to load theme preferences:', error);
            }
        }

        // Use system preferences or default
        if (this.options.respectSystemPreferences) {
            if (this.mediaQueries.highContrast.matches) {
                return 'high-contrast';
            }
            if (this.mediaQueries.darkMode.matches) {
                return 'dark';
            }
        }

        return this.options.defaultTheme;
    }

    /**
     * Saves current preferences
     */
    private savePreferences(): void {
        if (this.options.persistPreferences) {
            try {
                const preferences = {
                    theme: this.currentTheme,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem(this.options.storageKey, JSON.stringify(preferences));
            } catch (error) {
                console.warn('Failed to save theme preferences:', error);
            }
        }
    }

    /**
     * Resets to default preferences
     */
    reset(): void {
        if (this.options.persistPreferences) {
            try {
                localStorage.removeItem(this.options.storageKey);
            } catch (error) {
                console.warn('Failed to reset theme preferences:', error);
            }
        }
        this.setTheme(this.options.defaultTheme);
    }

    /**
     * Cleans up resources
     */
    destroy(): void {
        // Remove event listeners
        this.mediaQueries.darkMode.removeEventListener('change', () => {});
        this.mediaQueries.highContrast.removeEventListener('change', () => {});
        this.removeAllListeners();
    }
}
