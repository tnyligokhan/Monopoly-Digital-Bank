import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    loading: true,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                const { data: userData, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching user:', error);
                }

                set({ user: userData, session, loading: false });
            } else {
                set({ user: null, session: null, loading: false });
            }

            supabase.auth.onAuthStateChange(async (event, session) => {
                if (session?.user) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    set({ user: userData, session });
                } else {
                    set({ user: null, session: null });
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ loading: false });
        }
    },

    signInAnonymously: async () => {
        try {
            const { data, error } = await supabase.auth.signInAnonymously();

            if (error) {
                console.error('Supabase anonymous sign in error:', error);
                throw error;
            }

            if (!data?.user) {
                throw new Error('Kullanıcı oluşturulamadı');
            }

            const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${data.user.id}`;

            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    id: data.user.id,
                    name: '',
                    photo_url: avatarUrl,
                    current_game_id: null,
                    played_game_results: [],
                    is_anonymous: true
                });

            if (insertError && insertError.code !== '23505') {
                console.error('User insert error:', insertError);
                throw insertError;
            }

            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            set({ user: userData, session: data.session });

            return { success: true };
        } catch (error) {
            console.error('Sign in anonymously error:', error);
            return { success: false, error: error.message };
        }
    },

    signUpWithEmail: async (email, password, username) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${data.user.id}`;

                const { error: insertError } = await supabase
                    .from('users')
                    .insert({
                        id: data.user.id,
                        name: username,
                        photo_url: avatarUrl,
                        current_game_id: null,
                        played_game_results: [],
                        is_anonymous: false
                    });

                if (insertError && insertError.code !== '23505') {
                    throw insertError;
                }

                await supabase
                    .from('usernames')
                    .upsert({
                        user_id: data.user.id,
                        username: username.toLowerCase()
                    }, {
                        onConflict: 'user_id'
                    });
            }

            return { success: true };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    },

    signInWithEmail: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            set({ user: userData, session: data.session });
            return { success: true };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    },

    signOut: async () => {
        try {
            const user = get().user;

            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) throw signOutError;

            if (user && user.is_anonymous) {
                await supabase.from('users').delete().eq('id', user.id);
            }

            set({ user: null, session: null });
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    setUsername: async (username) => {
        try {
            const user = get().user;
            if (!user) throw new Error('Kullanıcı bulunamadı');

            if (user.name) {
                await supabase
                    .from('usernames')
                    .delete()
                    .eq('user_id', user.id);
            }

            const { error: usernameError } = await supabase
                .from('usernames')
                .upsert({
                    username: username.toLowerCase(),
                    user_id: user.id
                }, {
                    onConflict: 'user_id'
                });

            if (usernameError) throw usernameError;

            const { data: updatedUser, error } = await supabase
                .from('users')
                .update({ name: username })
                .eq('id', user.id)
                .select()
                .maybeSingle();

            if (error) throw error;

            set({ user: updatedUser });
            return { success: true };
        } catch (error) {
            console.error('Set username error:', error);
            return { success: false, error: error.message };
        }
    },

    setCurrentGameId: async (gameId) => {
        try {
            const user = get().user;
            if (!user) throw new Error('Kullanıcı bulunamadı');

            const { data: updatedUser, error } = await supabase
                .from('users')
                .update({ current_game_id: gameId })
                .eq('id', user.id)
                .select()
                .maybeSingle();

            if (error) throw error;

            set({ user: updatedUser });
            return { success: true };
        } catch (error) {
            console.error('Set current game error:', error);
            return { success: false, error: error.message };
        }
    }
}));
