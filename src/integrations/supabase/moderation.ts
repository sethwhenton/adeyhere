import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// --- Broadcast Only Mode ---
export const useToggleBroadcastOnly = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ spaceId, broadcastOnly }: { spaceId: string; broadcastOnly: boolean }) => {
            const { error } = await supabase
                .from('spaces')
                .update({ broadcast_only: broadcastOnly })
                .eq('id', spaceId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['spaces'] });
        },
    });
};

// --- Report User ---
export const useReportUser = () => {
    return useMutation({
        mutationFn: async ({
            spaceId,
            reporterId,
            reportedUserId,
            reason,
            details
        }: {
            spaceId: string;
            reporterId: string;
            reportedUserId: string;
            reason: string;
            details?: string;
        }) => {
            const { error } = await supabase
                .from('reports')
                .insert({
                    space_id: spaceId,
                    reporter_id: reporterId,
                    reported_user_id: reportedUserId,
                    reason,
                    details,
                });
            if (error) throw error;
        },
    });
};

// --- Ban from Space ---
export const useBanFromSpace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            spaceId,
            userId,
            bannedBy,
            reason
        }: {
            spaceId: string;
            userId: string;
            bannedBy: string;
            reason?: string;
        }) => {
            // First, add to bans
            const { error: banError } = await supabase
                .from('space_bans')
                .insert({
                    space_id: spaceId,
                    user_id: userId,
                    banned_by: bannedBy,
                    reason,
                });
            if (banError) throw banError;

            // Then, remove from participants
            const { error: removeError } = await supabase
                .from('participants')
                .delete()
                .eq('space_id', spaceId)
                .eq('user_id', userId);
            if (removeError) throw removeError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['participants'] });
        },
    });
};

// --- Unban User ---
export const useUnbanFromSpace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
            const { error } = await supabase
                .from('space_bans')
                .delete()
                .eq('space_id', spaceId)
                .eq('user_id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['space_bans'] });
        },
    });
};

// --- Check if user is banned ---
export const useIsUserBanned = (spaceId: string | undefined, userId: string | undefined) => {
    return useQuery({
        queryKey: ['banned', spaceId, userId],
        queryFn: async () => {
            if (!spaceId || !userId) return false;
            const { data, error } = await supabase
                .from('space_bans')
                .select('id')
                .eq('space_id', spaceId)
                .eq('user_id', userId)
                .maybeSingle();
            if (error) throw error;
            return !!data;
        },
        enabled: !!spaceId && !!userId,
    });
};

// --- Space Analytics ---
export const useSpaceAnalytics = (spaceId: string | undefined) => {
    return useQuery({
        queryKey: ['space_analytics', spaceId],
        queryFn: async () => {
            if (!spaceId) return null;

            // Get visitor count from past_events
            const { data: visitData, error: visitError } = await supabase
                .from('past_events')
                .select('user_id, visited_at, left_at')
                .eq('space_id', spaceId);

            if (visitError) throw visitError;

            // Get current participants
            const { data: participantData, error: participantError } = await supabase
                .from('participants')
                .select('user_id, joined_at')
                .eq('space_id', spaceId);

            if (participantError) throw participantError;

            // Get message count
            const { count: messageCount, error: messageError } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('space_id', spaceId);

            if (messageError) throw messageError;

            // Calculate peak time (most visits in a given hour)
            const hourCounts: Record<number, number> = {};
            visitData.forEach(v => {
                const hour = new Date(v.visited_at).getHours();
                hourCounts[hour] = (hourCounts[hour] || 0) + 1;
            });

            const peakHour = Object.entries(hourCounts).reduce(
                (max, [hour, count]) => count > max.count ? { hour: parseInt(hour), count } : max,
                { hour: 0, count: 0 }
            );

            return {
                totalVisitors: new Set(visitData.map(v => v.user_id)).size,
                currentParticipants: participantData.length,
                totalMessages: messageCount || 0,
                peakHour: peakHour.hour,
                peakVisitors: peakHour.count,
                visits: visitData,
                participants: participantData,
            };
        },
        enabled: !!spaceId,
        refetchInterval: 30000, // Refresh every 30 seconds
    });
};

// --- Get Reports for Space ---
export const useSpaceReports = (spaceId: string | undefined) => {
    return useQuery({
        queryKey: ['reports', spaceId],
        queryFn: async () => {
            if (!spaceId) return [];
            const { data, error } = await supabase
                .from('reports')
                .select(`
          *,
          reporter:profiles!reporter_id(display_name, avatar),
          reported:profiles!reported_user_id(display_name, avatar)
        `)
                .eq('space_id', spaceId)
                .is('resolved_at', null)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!spaceId,
    });
};
