import { useAppStore } from '@/store/appStore';
import { Onboarding } from '@/components/Onboarding';
import { MapView } from '@/components/MapView';
import { RadarView } from '@/components/RadarView';
import { BottomNav } from '@/components/BottomNav';
import { FriendsView } from '@/components/FriendsView';

const Index = () => {
  const { isOnboarded, viewMode, activeSpace } = useAppStore();

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background">
      {viewMode === 'friends' ? (
        <FriendsView />
      ) : activeSpace && viewMode === 'radar' ? (
        <RadarView />
      ) : (
        <MapView />
      )}
      <BottomNav />
    </div>
  );
};

export default Index;
