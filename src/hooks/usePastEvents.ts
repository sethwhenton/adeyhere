import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PastEvent {
    id: string;
    space_id: string;
    space_name: string;
    visited_at: string;
    left_at: string | null;
}

export const usePastEvents = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['past_events', userId],
        queryFn: async () => {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('past_events')
                .select('*')
                .eq('user_id', userId)
                .order('visited_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            return data as PastEvent[];
        },
        enabled: !!userId,
    });
};
