import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const avatarOptions = ['😊', '🎸', '🎨', '📸', '🎭', '🎵', '☕', '🌟', '🦋', '🌸', '🍀', '🔥'];

export function Onboarding() {
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentUser, setOnboarded } = useAppStore();

  const handleContinue = async () => {
    if (!displayName.trim()) return;

    setIsLoading(true);
    try {
      // 1. Sign in anonymously
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

      if (authError) throw authError;
      if (!authData.user) throw new Error("Authentication failed");

      // 2. Upsert profile
      const userProfile = {
        id: authData.user.id,
        display_name: displayName.trim(),
        avatar: selectedAvatar || '😊',
        is_ghost: false,
        location: { lat: 37.7749, lng: -122.4194 },
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(userProfile);

      if (profileError) throw profileError;

      // 3. Update store
      setCurrentUser({
        id: authData.user.id,
        displayName: userProfile.display_name,
        avatar: userProfile.avatar,
        isGhost: userProfile.is_ghost,
        location: userProfile.location,
      });

      setOnboarded(true);
      toast.success("Welcome to Adey Here!");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Something went wrong during onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo & Welcome */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-space shadow-glow flex items-center justify-center"
          >
            <MapPin className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to <span className="text-gradient-space">Adey Here</span>
          </h1>
          <p className="text-muted-foreground">
            Your pocket for local connections
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-card"
        >
          {/* Display Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              What should we call you?
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary"
                maxLength={20}
              />
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-foreground mb-3">
              Pick your avatar <span className="text-muted-foreground">(optional)</span>
            </label>
            <div className="grid grid-cols-6 gap-2">
              {avatarOptions.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all
                    ${selectedAvatar === emoji
                      ? 'bg-primary shadow-soft ring-2 ring-primary'
                      : 'bg-secondary hover:bg-secondary/80'
                    }`}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!displayName.trim() || isLoading}
            className="w-full h-12 gradient-space text-primary-foreground font-semibold rounded-xl shadow-soft hover:shadow-glow transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            No passwords, no hassle. Just you and your community.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
