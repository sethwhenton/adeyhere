import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Radar, Users, Settings } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { SettingsMenu } from '@/components/SettingsMenu';
import { ViewMode } from '@/types';

interface NavItem {
  id: ViewMode | 'friends' | 'settings';
  icon: typeof Map;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'map', icon: Map, label: 'Explore' },
  { id: 'friends', icon: Users, label: 'Friends' },
];

export function BottomNav() {
  const { viewMode, setViewMode, activeSpace } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);

  // Only show radar option when in a space
  const visibleItems = activeSpace
    ? [...navItems.slice(0, 1), { id: 'radar' as const, icon: Radar, label: 'Radar' }, ...navItems.slice(1)]
    : navItems;

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4"
      >
        <div className="max-w-md mx-auto bg-card backdrop-blur-lg rounded-2xl shadow-card p-2 border border-border/50">
          <div className="flex items-center justify-center gap-2">
            {/* Navigation Items */}
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'friends' ? false : viewMode === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id !== 'settings') {
                      setViewMode(item.id as ViewMode);
                    }
                  }}
                  className={`relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all flex-1 ${isActive
                    ? 'text-space-deep'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-space/20 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="text-xs font-medium relative z-10">{item.label}</span>
                </button>
              );
            })}

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`relative flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all flex-1 ${showSettings
                ? 'text-space-deep'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {showSettings && (
                <motion.div
                  layoutId="nav-indicator-settings"
                  className="absolute inset-0 bg-space/20 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Settings className="w-5 h-5 relative z-10" />
              <span className="text-xs font-medium relative z-10">Settings</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Settings Menu Modal */}
      <AnimatePresence>
        {showSettings && (
          <SettingsMenu onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
