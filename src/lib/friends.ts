import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type FriendStatus = 'pending' | 'accepted';

export type FriendItem = {
  friendshipId: string;
  userId: string;
  email: string;
  displayName: string | null;
  status: FriendStatus;
  incoming: boolean;
};

export type FriendRequestResult =
  | 'sent'
  | 'accepted'
  | 'already_friends'
  | 'already_sent'
  | 'not_found'
  | 'self';

type FriendshipRow = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendStatus;
};

type ProfileRow = {
  user_id: string;
  email: string;
  display_name: string | null;
};

export const upsertProfile = async (session: Session) => {
  const email = session.user.email?.toLowerCase();
  if (!email) return;
  await supabase.from('profiles').upsert({
    user_id: session.user.id,
    email,
    display_name: session.user.user_metadata.name ?? email,
    updated_at: new Date().toISOString(),
  });
};

export const loadFriends = async (userId: string): Promise<FriendItem[]> => {
  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('id,requester_id,addressee_id,status')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;

  const rows = (friendships ?? []) as FriendshipRow[];
  const ids = rows.map((row) => (row.requester_id === userId ? row.addressee_id : row.requester_id));
  const profiles = await loadProfiles(ids);

  return rows.map((row) => {
    const friendId = row.requester_id === userId ? row.addressee_id : row.requester_id;
    const profile = profiles.get(friendId);
    return {
      friendshipId: row.id,
      userId: friendId,
      email: profile?.email ?? 'unknown',
      displayName: profile?.display_name ?? null,
      status: row.status,
      incoming: row.addressee_id === userId,
    };
  });
};

export const requestFriend = async (email: string, userId: string): Promise<FriendRequestResult> => {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return 'not_found';

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', normalizedEmail)
    .maybeSingle<{ user_id: string }>();
  if (profileError) throw profileError;
  if (!profile) return 'not_found';
  if (profile.user_id === userId) return 'self';

  const { data: existingRows, error: existingError } = await supabase
    .from('friendships')
    .select('id,requester_id,addressee_id,status')
    .or(`and(requester_id.eq.${userId},addressee_id.eq.${profile.user_id}),and(requester_id.eq.${profile.user_id},addressee_id.eq.${userId})`)
    .limit(1);
  if (existingError) throw existingError;

  const existing = ((existingRows ?? []) as FriendshipRow[])[0];
  if (existing?.status === 'accepted') return 'already_friends';
  if (existing?.requester_id === userId) return 'already_sent';
  if (existing?.addressee_id === userId) {
    await acceptFriend(existing.id);
    return 'accepted';
  }

  const { error } = await supabase.from('friendships').insert({
    requester_id: userId,
    addressee_id: profile.user_id,
  });
  if (error && error.code !== '23505') throw error;
  return 'sent';
};

export const acceptFriend = async (friendshipId: string) => {
  const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
  if (error) throw error;
};

const loadProfiles = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, ProfileRow>();
  const { data, error } = await supabase.from('profiles').select('user_id,email,display_name').in('user_id', ids);
  if (error) throw error;
  return new Map(((data ?? []) as ProfileRow[]).map((profile) => [profile.user_id, profile]));
};
