import { useAppStore } from '@/store/appStore';
import { Onboarding } from '@/components/Onboarding';
import { MapView } from '@/components/MapView';
import { RadarView } from '@/components/RadarView';
import { BottomNav } from '@/components/BottomNav';

const Index = () => {
  const { isOnboarded, viewMode, activeSpace } = useAppStore();

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background">
      {activeSpace && viewMode === 'radar' ? <RadarView /> : <MapView />}
      <BottomNav />
    </div>
  );
};

export default Index;
