import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// --- Ghost Mode ---
export const useToggleGhostMode = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, isGhost }: { userId: string; isGhost: boolean }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ is_ghost: isGhost })
                .eq('id', userId);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['participants'] });
        },
    });
};

// --- Status Vibes ---
export const useUpdateStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, status, statusEmoji }: { userId: string; status: string | null; statusEmoji?: string }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ status, status_emoji: statusEmoji })
                .eq('id', userId);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
            queryClient.invalidateQueries({ queryKey: ['participants'] });
        },
    });
};

// --- Pounces (Quick Messages) ---
export const useSendPounce = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            fromUserId,
            toUserId,
            pounceType,
            message,
            spaceId
        }: {
            fromUserId: string;
            toUserId: string;
            pounceType: 'wave' | 'wink' | 'nod' | 'high-five' | 'custom';
            message?: string;
            spaceId?: string;
        }) => {
            const { error } = await supabase
                .from('pounces')
                .insert({
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    pounce_type: pounceType,
                    message,
                    space_id: spaceId,
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pounces'] });
        },
    });
};

export const usePounces = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['pounces', userId],
        queryFn: async () => {
            if (!userId) return [];
            const { data, error } = await supabase
                .from('pounces')
                .select(`
          *,
          from_user:profiles!from_user_id(id, display_name, avatar, is_ghost)
        `)
                .eq('to_user_id', userId)
                .is('seen_at', null)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });
};

export const useMarkPounceSeen = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (pounceId: string) => {
            const { error } = await supabase
                .from('pounces')
                .update({ seen_at: new Date().toISOString() })
                .eq('id', pounceId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pounces'] });
        },
    });
};

// --- Connections (Friend Links) ---
export const useSendConnectionRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requesterId, receiverId }: { requesterId: string; receiverId: string }) => {
            const { error } = await supabase
                .from('connections')
                .upsert({
                    requester_id: requesterId,
                    receiver_id: receiverId,
                    status: 'pending',
                });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connections'] });
        },
    });
};

export const useRespondToConnection = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ connectionId, accept }: { connectionId: string; accept: boolean }) => {
            const { error } = await supabase
                .from('connections')
                .update({
                    status: accept ? 'accepted' : 'declined',
                    accepted_at: accept ? new Date().toISOString() : null,
                })
                .eq('id', connectionId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['connections'] });
        },
    });
};

export const useConnections = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['connections', userId],
        queryFn: async () => {
            if (!userId) return { incoming: [], outgoing: [], linked: [] };

            const { data, error } = await supabase
                .from('connections')
                .select(`
          *,
          requester:profiles!requester_id(id, display_name, avatar),
          receiver:profiles!receiver_id(id, display_name, avatar)
        `)
                .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

            if (error) throw error;

            const incoming = data.filter(c => c.receiver_id === userId && c.status === 'pending');
            const outgoing = data.filter(c => c.requester_id === userId && c.status === 'pending');
            const linked = data.filter(c => c.status === 'accepted');

            return { incoming, outgoing, linked };
        },
        enabled: !!userId,
    });
};
