import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ghost, Eye, MessageCircle, Send, ArrowLeft, Radio, UserPlus, Sparkles, Palette, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { distanceToRadarPosition } from '@/lib/geo';
import { User, Announcement } from '@/types';
import { TownSquare } from './TownSquare';
import { PounceModal } from './PounceModal';
import { StatusPicker } from './StatusPicker';
import { ConnectionRequestModal } from './ConnectionRequestModal';
import { PounceNotifications } from './PounceNotifications';
import { HostControlsPanel } from './HostControlsPanel';
import { SpaceAnalyticsModal } from './SpaceAnalyticsModal';
import { ModerationModal } from './ModerationModal';
import { BeaconModal } from './BeaconModal';
import { ThemePicker } from './ThemePicker';
import { AnnouncementBell } from './AnnouncementBell';
import { AnnouncementFeed } from './AnnouncementFeed';
import { AnnouncementCreator } from './AnnouncementCreator';
import { CommunityHub } from './CommunityHub';
import { useParticipants, useDeleteSpace, useAnnouncements, useCreateAnnouncement } from '@/integrations/supabase/hooks';
import { useRealtimeParticipants, useRealtimeAnnouncements } from '@/integrations/supabase/realtime';
import { useToggleGhostMode } from '@/integrations/supabase/interactions';
import { haptics } from '@/lib/haptics';
import { toast } from 'sonner';

export function RadarView() {
  const { activeSpace, currentUser, toggleGhostMode, logout, setActiveSpace } = useAppStore();
  const [selectedNode, setSelectedNode] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showPounce, setShowPounce] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showConnectionRequest, setShowConnectionRequest] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showModeration, setShowModeration] = useState(false);
  const [showBeacon, setShowBeacon] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showAnnouncementFeed, setShowAnnouncementFeed] = useState(false);
  const [showAnnouncementCreator, setShowAnnouncementCreator] = useState(false);
  const [showCommunityHub, setShowCommunityHub] = useState(false);

  // Real announcements from database
  const { data: announcementsData = [] } = useAnnouncements(activeSpace?.id);
  const createAnnouncementMutation = useCreateAnnouncement();

  // Convert DB format to UI format
  const announcements: Announcement[] = announcementsData.map(a => ({
    id: a.id,
    spaceId: a.space_id,
    hostId: a.host_id,
    content: a.content,
    imageUrl: a.image_url || undefined,
    linkUrl: a.link_url || undefined,
    linkText: a.link_text || undefined,
    createdAt: new Date(a.created_at),
    readBy: [], // We'll handle read status locally for now
  }));

  // Handler to publish announcements to database
  const handlePublishAnnouncement = async (data: { content: string; imageUrl?: string; linkUrl?: string; linkText?: string }) => {
    if (!activeSpace || !currentUser) return;

    try {
      await createAnnouncementMutation.mutateAsync({
        spaceId: activeSpace.id,
        hostId: currentUser.id,
        content: data.content,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        linkText: data.linkText,
      });
      toast.success('Announcement posted!');
    } catch (error) {
      console.error('Failed to post announcement:', error);
      toast.error('Failed to post announcement');
    }
  };

  const handleMarkAnnouncementRead = (id: string) => {
    // For now we handle read status locally - could store in localStorage
    // or create a separate announcement_reads table if persistence is needed
  };

  const handleCloseSpace = async () => {
    if (!activeSpace || !currentUser) return;

    try {
      await deleteSpaceMutation.mutateAsync({
        spaceId: activeSpace.id,
        hostId: currentUser.id
      });

      toast.success('Space closed and all data deleted');

      // Clear active space and return to map
      setActiveSpace(null);
    } catch (e) {
      console.error('Failed to close space:', e);
      toast.error('Failed to close space');
    }
  };

  const { data: participantsRaw = [] } = useParticipants(activeSpace?.id);
  const deleteSpaceMutation = useDeleteSpace();
  const ghostModeMutation = useToggleGhostMode();
  const leaveSpace = () => setActiveSpace(null);

  // Map participants to include isHost flag
  const participants = participantsRaw.map(p => ({
    ...p,
    isHost: p.id === activeSpace?.hostId
  }));

  // Real-time subscription for instant participant updates
  useRealtimeParticipants(activeSpace?.id);

  // Real-time subscription for instant announcement updates
  useRealtimeAnnouncements(activeSpace?.id);

  // Handle ghost mode with database sync
  const handleGhostModeToggle = async () => {
    if (!currentUser) return;
    const newGhostState = !currentUser.isGhost;
    toggleGhostMode(); // Update local state immediately
    try {
      await ghostModeMutation.mutateAsync({ userId: currentUser.id, isGhost: newGhostState });
      toast(newGhostState ? 'You are now invisible 👻' : 'You are now visible ✨');
    } catch (error) {
      toggleGhostMode(); // Revert on error
      toast.error('Failed to update ghost mode');
    }
  };

  if (!activeSpace || !currentUser) return null;

  const isHost = activeSpace.hostId === currentUser.id;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Pounce Notifications */}
      <PounceNotifications userId={currentUser?.id} />

      {/* Host Controls Panel - Only visible to hosts */}
      {isHost && (
        <HostControlsPanel
          spaceId={activeSpace.id}
          spaceName={activeSpace.name}
          onOpenAnalytics={() => setShowAnalytics(true)}
          onCreateAnnouncement={() => setShowAnnouncementCreator(true)}
          onCloseSpace={handleCloseSpace}
        />
      )}

      {/* Announcement Bell - Only visible to attendees */}
      {!isHost && (
        <div className="absolute top-28 left-4 z-30">
          <AnnouncementBell
            announcements={announcements}
            userId={currentUser.id}
            onOpen={() => setShowAnnouncementFeed(true)}
          />
        </div>
      )}

      {/* Radar Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Radar circles */}
        {[1, 0.75, 0.5, 0.25].map((scale, i) => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-space/60 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
            style={{
              width: `${scale * 80}%`,
              height: `${scale * 80}%`,
            }}
          />
        ))}

        {/* Radar sweep animation */}
        <div className="absolute w-full h-full radar-sweep opacity-20">
          <div
            className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--space-blue)) 0%, transparent 100%)',
            }}
          />
        </div>

        {/* Center point (you) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute z-20"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-full gradient-space shadow-glow flex items-center justify-center text-xl border-2 border-card">
              {currentUser.isGhost ? '👻' : currentUser.avatar}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-space-deep text-card text-xs rounded-full font-medium">
              You
            </div>
          </div>
        </motion.div>

        {/* Other participants as nodes */}
        {participants
          .filter((p) => p.id !== currentUser.id)
          .map((participant, index) => {
            const position = distanceToRadarPosition(
              currentUser.location,
              participant.location,
              activeSpace.radius
            );

            return (
              <motion.button
                key={participant.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                onClick={() => setSelectedNode(participant)}
                className="absolute node-float"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  animationDelay: `${index * 0.5}s`,
                }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 border-card shadow-soft transition-transform hover:scale-110 ${participant.isHost
                    ? 'bg-broadcast text-broadcast-foreground'
                    : participant.isGhost
                      ? 'bg-ghost text-card'
                      : 'bg-secondary text-foreground'
                    }`}
                >
                  {participant.isHost ? '👑' : participant.isGhost ? '👻' : participant.avatar}
                </div>
                {!participant.isGhost && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap">
                    {participant.displayName}
                  </span>
                )}
              </motion.button>
            );
          })}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-30">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/90 backdrop-blur-lg rounded-2xl p-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={leaveSpace}
                className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-foreground">{activeSpace.name}</h2>
                  {isHost && (
                    <span className="px-2 py-0.5 bg-broadcast/20 text-broadcast rounded-full text-xs font-medium">
                      Host
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {participants.length} people here
                </p>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/20 rounded-full">
              <Radio className="w-3 h-3 text-success animate-pulse" />
              <span className="text-xs font-medium text-success">Live</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ghost Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-28 right-4 z-30 flex flex-col gap-2"
      >
        <button
          onClick={handleGhostModeToggle}
          disabled={ghostModeMutation.isPending}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-card transition-all ${currentUser.isGhost
            ? 'bg-ghost/20 text-ghost'
            : 'bg-card text-foreground'
            }`}
        >
          {currentUser.isGhost ? (
            <>
              <Ghost className="w-5 h-5" />
              <span className="text-sm font-medium">Ghost Mode</span>
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">Visible</span>
            </>
          )}
        </button>

        {/* Chat Button - Opens Community Hub */}
        <button
          onClick={() => {
            setShowCommunityHub(true);
            haptics.tap();
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl shadow-card bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-foreground"
        >
          <MessageCircle className="w-5 h-5 text-sky-500" />
          <span className="text-sm font-medium">Chat</span>
        </button>

        {/* Beacon Button */}
        <button
          onClick={() => {
            setShowBeacon(true);
            haptics.tap();
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl shadow-card bg-gradient-to-r from-red-500/20 to-amber-500/20 text-foreground"
        >
          <Radio className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">Beacon</span>
        </button>
      </motion.div>



      {/* Node Detail Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-4 right-4 z-40"
          >
            <div className="bg-card rounded-2xl p-4 shadow-card">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${selectedNode.isHost
                    ? 'bg-broadcast/20'
                    : selectedNode.isGhost
                      ? 'bg-ghost/20'
                      : 'bg-secondary'
                    }`}
                >
                  {selectedNode.isHost
                    ? '👑'
                    : selectedNode.isGhost
                      ? '👻'
                      : selectedNode.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {selectedNode.isGhost ? 'Anonymous' : selectedNode.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedNode.isHost ? 'Space Host' : 'Participant'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  className="flex-1 h-10 rounded-xl"
                  onClick={() => {
                    setShowPounce(true);
                  }}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Say Hi
                </Button>
                {!selectedNode.isGhost && (
                  <Button
                    variant="secondary"
                    className="flex-1 h-10 rounded-xl"
                    onClick={() => setShowConnectionRequest(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Link
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Town Square Chat */}
      <TownSquare isOpen={showChat} onClose={() => setShowChat(false)} />

      {/* Pounce Modal */}
      {selectedNode && (
        <PounceModal
          isOpen={showPounce}
          onClose={() => setShowPounce(false)}
          targetUser={{
            id: selectedNode.id,
            displayName: selectedNode.displayName,
            avatar: selectedNode.avatar,
          }}
          currentUserId={currentUser.id}
          spaceId={activeSpace.id}
        />
      )}

      {/* Connection Request Modal */}
      {selectedNode && (
        <ConnectionRequestModal
          isOpen={showConnectionRequest}
          onClose={() => setShowConnectionRequest(false)}
          targetUser={{
            id: selectedNode.id,
            displayName: selectedNode.displayName,
            avatar: selectedNode.avatar,
          }}
          currentUserId={currentUser.id}
        />
      )}

      {/* Status Picker */}
      <StatusPicker
        isOpen={showStatus}
        onClose={() => setShowStatus(false)}
        userId={currentUser.id}
      />

      {/* Space Analytics Modal */}
      <SpaceAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        spaceId={activeSpace.id}
        spaceName={activeSpace.name}
      />

      {/* Moderation Modal */}
      {selectedNode && (
        <ModerationModal
          isOpen={showModeration}
          onClose={() => setShowModeration(false)}
          targetUser={{
            id: selectedNode.id,
            displayName: selectedNode.displayName,
            avatar: selectedNode.avatar,
          }}
          spaceId={activeSpace.id}
          currentUserId={currentUser.id}
          isHost={isHost}
        />
      )}

      {/* Beacon Modal */}
      <BeaconModal
        isOpen={showBeacon}
        onClose={() => setShowBeacon(false)}
        userId={currentUser.id}
      />

      {/* Theme Picker */}
      <ThemePicker
        isOpen={showTheme}
        onClose={() => setShowTheme(false)}
      />

      {/* Announcement Feed (Attendees) */}
      <AnnouncementFeed
        isOpen={showAnnouncementFeed}
        onClose={() => setShowAnnouncementFeed(false)}
        announcements={announcements}
        userId={currentUser.id}
        onMarkAsRead={handleMarkAnnouncementRead}
      />

      {/* Announcement Creator (Host) */}
      <AnnouncementCreator
        isOpen={showAnnouncementCreator}
        onClose={() => setShowAnnouncementCreator(false)}
        onPublish={handlePublishAnnouncement}
      />

      {/* Community Hub */}
      <CommunityHub
        isOpen={showCommunityHub}
        onClose={() => setShowCommunityHub(false)}
        spaceId={activeSpace.id}
        spaceName={activeSpace.name}
        isHost={isHost}
        currentUserId={currentUser.id}
        latestAnnouncement={announcements[0]}
      />
    </div>
  );
}

