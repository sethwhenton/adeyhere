import { motion } from 'framer-motion';
import { Map, Radar, MessageSquare, User } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ViewMode } from '@/types';

interface NavItem {
  id: ViewMode;
  icon: typeof Map;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'map', icon: Map, label: 'Explore' },
  { id: 'radar', icon: Radar, label: 'Radar' },
];

export function BottomNav() {
  const { viewMode, setViewMode, activeSpace } = useAppStore();

  // Only show radar option when in a space
  const visibleItems = activeSpace
    ? navItems
    : navItems.filter((item) => item.id !== 'radar');

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 p-4"
    >
      <div className="max-w-md mx-auto bg-card/90 backdrop-blur-lg rounded-2xl shadow-card p-2">
        <div className="flex items-center justify-around">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = viewMode === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  isActive
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
        </div>
      </div>
    </motion.nav>
  );
}
