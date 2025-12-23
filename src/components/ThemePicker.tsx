import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Check } from 'lucide-react';
import { THEMES, ThemeId, applyTheme, getCurrentTheme } from '@/lib/themes';
import { haptics } from '@/lib/haptics';

interface ThemePickerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ThemePicker({ isOpen, onClose }: ThemePickerProps) {
    const [selectedTheme, setSelectedTheme] = useState<ThemeId>(getCurrentTheme());

    const handleThemeSelect = (themeId: ThemeId) => {
        setSelectedTheme(themeId);
        applyTheme(themeId);
        haptics.tap();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4"
                    >
                        <div className="bg-card rounded-3xl p-5 shadow-card max-w-lg mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl gradient-space flex items-center justify-center">
                                        <Palette className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">Choose Theme</h3>
                                        <p className="text-sm text-muted-foreground">Set the vibe for your experience</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Theme Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {Object.values(THEMES).map((theme) => (
                                    <motion.button
                                        key={theme.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleThemeSelect(theme.id)}
                                        className={`relative p-4 rounded-2xl text-left transition-all ${selectedTheme === theme.id
                                                ? 'ring-2 ring-space'
                                                : 'bg-secondary hover:bg-secondary/80'
                                            }`}
                                        style={{
                                            background: selectedTheme === theme.id
                                                ? `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
                                                : undefined,
                                        }}
                                    >
                                        {/* Selected Check */}
                                        {selectedTheme === theme.id && (
                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-space flex items-center justify-center">
                                                <Check className="w-3 h-3 text-primary-foreground" />
                                            </div>
                                        )}

                                        {/* Color Preview */}
                                        <div className="flex gap-1 mb-2">
                                            <div
                                                className="w-6 h-6 rounded-full"
                                                style={{ background: theme.colors.primary }}
                                            />
                                            <div
                                                className="w-6 h-6 rounded-full"
                                                style={{ background: theme.colors.secondary }}
                                            />
                                            <div
                                                className="w-6 h-6 rounded-full"
                                                style={{ background: theme.colors.accent }}
                                            />
                                        </div>

                                        {/* Theme Info */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-lg">{theme.emoji}</span>
                                            <span className="font-semibold text-foreground">{theme.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{theme.description}</p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
