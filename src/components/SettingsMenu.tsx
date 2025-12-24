import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Trash2, LogOut, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/appStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const avatarOptions = ['😊', '🎸', '🎨', '📸', '🎭', '🎵', '☕', '🌟', '🦋', '🌸', '🍀', '🔥'];

interface SettingsMenuProps {
    onClose?: () => void;
}

export function SettingsMenu({ onClose }: SettingsMenuProps) {
    const { currentUser, updateProfile, logout } = useAppStore();
    const [isOpen, setIsOpen] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '😊');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const hasChanges =
        displayName !== currentUser?.displayName ||
        selectedAvatar !== currentUser?.avatar;

    const handleClose = () => {
        setIsOpen(false);
        onClose?.();
    };

    const handleSaveChanges = async () => {
        if (!currentUser || !displayName.trim()) return;

        setIsUpdating(true);
        try {
            // Update profile in Supabase
            // @ts-ignore - Supabase types not yet generated
            const { error } = await supabase
                .from('profiles' as any)
                .update({
                    display_name: displayName.trim(),
                    avatar: selectedAvatar,
                } as any)
                .eq('id', currentUser.id);

            if (error) throw error;

            // Update local state
            updateProfile({
                displayName: displayName.trim(),
                avatar: selectedAvatar,
            });

            toast.success('Profile updated successfully!');
            handleClose();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!currentUser) return;

        setIsDeleting(true);
        try {
            // Delete profile from database
            // @ts-ignore - Supabase types not yet generated
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', currentUser.id);

            if (profileError) throw profileError;

            // Sign out from Supabase
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;

            // Clear local state
            logout();

            toast.success('Account deleted successfully');
            setIsDeleteDialogOpen(false);
            handleClose();
        } catch (error: any) {
            console.error('Error deleting account:', error);
            toast.error(error.message || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            logout();
            toast.success('Logged out successfully');
            handleClose();
        } catch (error: any) {
            console.error('Error logging out:', error);
            toast.error('Failed to log out');
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Settings
                        </DialogTitle>
                        <DialogDescription>
                            Manage your profile and account settings
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Enter your display name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="pl-10"
                                    maxLength={20}
                                />
                            </div>
                        </div>

                        {/* Avatar Selection */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-3">
                                Avatar
                            </label>
                            <div className="grid grid-cols-6 gap-2">
                                {avatarOptions.map((emoji) => (
                                    <motion.button
                                        key={emoji}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedAvatar(emoji)}
                                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all
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

                        {/* Save Changes Button */}
                        <Button
                            onClick={handleSaveChanges}
                            disabled={!hasChanges || !displayName.trim() || isUpdating}
                            className="w-full"
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        <div className="border-t border-border" />

                        {/* Logout Button */}
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>

                        {/* Delete Account Button */}
                        <Button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            variant="destructive"
                            className="w-full"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                        </Button>

                        {/* Current User Info */}
                        <div className="text-xs text-muted-foreground text-center pt-2">
                            Logged in as {currentUser?.displayName}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove all your data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Account'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
