import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./client";
import { Space, Message, User } from "@/types";

// --- Profiles ---

export const useProfile = (userId: string | undefined) => {
    return useQuery({
        queryKey: ["profile", userId],
        queryFn: async () => {
            if (!userId) return null;
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!userId,
    });
};

// --- Spaces ---

export const useSpaces = (lat: number, lng: number, range: number = 2000) => {
    return useQuery({
        queryKey: ["spaces"],
        queryFn: async () => {
            // For a real app, you'd use PostGIS filter here. 
            // For MVP, we fetch all active and filter client-side or simple box filter
            const { data, error } = await supabase
                .from("spaces")
                .select(`
          *,
          host:profiles!host_id(display_name),
          participants:participants(count)
        `)
                .gt("expires_at", new Date().toISOString());

            if (error) throw error;
            return data;
        },
    });
};

export const useCreateSpace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newSpace: Omit<Space, 'id' | 'createdAt' | 'participants'>) => {
            const { data, error } = await supabase
                .from("spaces")
                .insert([{
                    name: newSpace.name,
                    host_id: newSpace.hostId,
                    center_lat: newSpace.center.lat,
                    center_lng: newSpace.center.lng,
                    radius: newSpace.radius,
                    expires_at: newSpace.expiresAt.toISOString(),
                    description: newSpace.description
                }])
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["spaces"] });
        },
    });
};

export const useDeleteSpace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ spaceId, hostId }: { spaceId: string, hostId: string }) => {
            const { error } = await supabase
                .from("spaces")
                .delete()
                .eq("id", spaceId)
                .eq("host_id", hostId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["spaces"] });
        },
    });
};

export const useJoinSpace = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ spaceId, userId }: { spaceId: string, userId: string }) => {
            const { error } = await supabase
                .from("participants")
                .upsert([{ space_id: spaceId, user_id: userId }]);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["participants", variables.spaceId] });
            queryClient.invalidateQueries({ queryKey: ["spaces"] });
        },
    });
};

export const useParticipants = (spaceId: string | undefined) => {
    return useQuery({
        queryKey: ["participants", spaceId],
        queryFn: async () => {
            if (!spaceId) return [];
            const { data, error } = await supabase
                .from("participants")
                .select(`
          user_id,
          profile:profiles!user_id(*)
        `)
                .eq("space_id", spaceId);

            if (error) throw error;
            return data.map(p => ({
                id: p.profile.id,
                displayName: p.profile.display_name,
                avatar: p.profile.avatar,
                isGhost: p.profile.is_ghost,
                location: p.profile.location as unknown as { lat: number; lng: number },
            }));
        },
        enabled: !!spaceId,
    });
};

// --- Messages ---

export const useMessages = (spaceId: string | undefined) => {
    return useQuery({
        queryKey: ["messages", spaceId],
        queryFn: async () => {
            if (!spaceId) return [];
            const { data, error } = await supabase
                .from("messages")
                .select(`
          *,
          user:profiles!user_id(display_name, avatar, is_ghost)
        `)
                .eq("space_id", spaceId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data.map(m => ({
                id: m.id,
                userId: m.user_id,
                userName: m.user.is_ghost ? "Anonymous" : m.user.display_name,
                userAvatar: m.user.is_ghost ? "👻" : m.user.avatar,
                content: m.content,
                timestamp: new Date(m.created_at),
                isBroadcast: m.is_broadcast
            }));
        },
        enabled: !!spaceId,
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ spaceId, userId, content, isBroadcast }: { spaceId: string, userId: string, content: string, isBroadcast?: boolean }) => {
            const { error } = await supabase
                .from("messages")
                .insert([{
                    space_id: spaceId,
                    user_id: userId,
                    content,
                    is_broadcast: !!isBroadcast
                }]);
            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["messages", variables.spaceId] });
        },
    });
};
