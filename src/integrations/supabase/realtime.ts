import { useEffect } from 'react';
import { supabase } from './client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to subscribe to real-time message updates in a space
 */
export const useRealtimeMessages = (spaceId: string | undefined) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!spaceId) return;

        const channel = supabase
            .channel(`messages:${spaceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `space_id=eq.${spaceId}`,
                },
                () => {
                    // Invalidate and refetch messages when a new one arrives
                    queryClient.invalidateQueries({ queryKey: ['messages', spaceId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId, queryClient]);
};

/**
 * Hook to subscribe to real-time participant updates in a space
 */
export const useRealtimeParticipants = (spaceId: string | undefined) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!spaceId) return;

        const channel = supabase
            .channel(`participants:${spaceId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'participants',
                    filter: `space_id=eq.${spaceId}`,
                },
                () => {
                    // Invalidate and refetch participants when someone joins/leaves
                    queryClient.invalidateQueries({ queryKey: ['participants', spaceId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId, queryClient]);
};

/**
 * Hook to subscribe to real-time space updates (for live counts)
 */
export const useRealtimeSpaces = () => {
    const queryClient = useQueryClient();

    useEffect(() => {
        const channel = supabase
            .channel('spaces')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'spaces',
                },
                () => {
                    // Invalidate spaces list when any space is created/updated
                    queryClient.invalidateQueries({ queryKey: ['spaces'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
};

/**
 * Hook to subscribe to real-time announcement updates in a space
 */
export const useRealtimeAnnouncements = (spaceId: string | undefined) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!spaceId) return;

        const channel = supabase
            .channel(`announcements:${spaceId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'announcements',
                    filter: `space_id=eq.${spaceId}`,
                },
                () => {
                    // Invalidate and refetch announcements when a new one is posted
                    queryClient.invalidateQueries({ queryKey: ['announcements', spaceId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [spaceId, queryClient]);
};
