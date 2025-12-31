import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const PLAYER_COLORS = [
    '#2196F3', // Mavi
    '#009688', // Teal
    '#4CAF50', // Yeşil
    '#FFEB3B', // Sarı
    '#FF9800', // Turuncu
    '#F44336', // Kırmızı
];

const MAX_PLAYERS = 6;

export const useGameStore = create((set, get) => ({
    currentGame: null,
    games: [],
    loading: false,
    realtimeChannel: null,

    generateGameId: () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    createGame: async (settings, userId) => {
        try {
            set({ loading: true });

            let gameId = get().generateGameId();

            // Benzersiz ID kontrolü
            let exists = true;
            while (exists) {
                const { data } = await supabase
                    .from('games')
                    .select('id')
                    .eq('id', gameId)
                    .single();

                if (!data) {
                    exists = false;
                } else {
                    gameId = get().generateGameId();
                }
            }

            // Oyun oluştur
            const { error } = await supabase
                .from('games')
                .insert({
                    id: gameId,
                    starting_capital: settings.startingCapital,
                    salary: settings.salary,
                    enable_free_parking: settings.enableFreeParking,
                    free_parking_money: 0,
                    players: [],
                    transaction_history: [],
                    starting_timestamp: null,
                    winner_id: null
                })
                .select()
                .single();

            if (error) throw error;

            // Oyuna katıl
            await get().joinGame(gameId, userId, true);

            set({ loading: false });
            return { success: true, gameId };
        } catch (error) {
            console.error('Create game error:', error);
            set({ loading: false });
            return { success: false, error: error.message };
        }
    },

    joinGame: async (gameId, userId, isCreator = false) => {
        try {
            set({ loading: true });

            // Oyunu getir
            const { data: game, error: gameError } = await supabase
                .from('games')
                .select('*')
                .eq('id', gameId.toUpperCase())
                .single();

            if (gameError || !game) {
                set({ loading: false });
                return { success: false, error: 'Oyun bulunamadı' };
            }

            // Kullanıcı bilgisini getir
            const { data: user } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (!user) {
                set({ loading: false });
                return { success: false, error: 'Kullanıcı bulunamadı' };
            }

            // Oyuncu zaten oyunda mı?
            const playerExists = game.players.some(p => p.user_id === userId);

            if (!playerExists) {
                // Oyun başladı mı?
                if (game.starting_timestamp) {
                    set({ loading: false });
                    return { success: false, error: 'Oyun zaten başlamış' };
                }

                // Maksimum oyuncu sayısı kontrolü
                if (game.players.length >= MAX_PLAYERS) {
                    set({ loading: false });
                    return { success: false, error: 'Oyun dolu (maksimum 6 oyuncu)' };
                }

                // Yeni oyuncu ekle
                const newPlayer = {
                    user_id: userId,
                    name: user.name,
                    balance: game.starting_capital,
                    color: PLAYER_COLORS[game.players.length],
                    bankrupt_timestamp: null,
                    is_game_creator: isCreator
                };

                const updatedPlayers = [...game.players, newPlayer];

                const { error: updateError } = await supabase
                    .from('games')
                    .update({ players: updatedPlayers })
                    .eq('id', gameId.toUpperCase());

                if (updateError) throw updateError;
            }

            // Kullanıcının current_game_id'sini güncelle
            await supabase
                .from('users')
                .update({ current_game_id: gameId.toUpperCase() })
                .eq('id', userId);

            // Oyunu dinlemeye başla
            get().subscribeToGame(gameId.toUpperCase());

            set({ loading: false });
            return { success: true };
        } catch (error) {
            console.error('Join game error:', error);
            set({ loading: false });
            return { success: false, error: error.message };
        }
    },

    subscribeToGame: (gameId) => {
        // Mevcut kanalı kapat
        const currentChannel = get().realtimeChannel;
        if (currentChannel) {
            supabase.removeChannel(currentChannel);
        }

        // Yeni kanal oluştur
        const channel = supabase
            .channel(`game:${gameId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'games',
                    filter: `id=eq.${gameId}`
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        set({ currentGame: payload.new });
                    } else if (payload.eventType === 'DELETE') {
                        set({ currentGame: null });
                    }
                }
            )
            .subscribe();

        set({ realtimeChannel: channel });

        // İlk veriyi getir
        supabase
            .from('games')
            .select('*')
            .eq('id', gameId)
            .single()
            .then(({ data }) => {
                if (data) {
                    set({ currentGame: data });
                }
            });
    },

    leaveGame: async (userId) => {
        try {
            const currentGame = get().currentGame;
            if (!currentGame) return { success: false, error: 'Oyun bulunamadı' };

            const player = currentGame.players.find(p => p.user_id === userId);
            if (!player) return { success: true };

            // Tek oyuncu kaldıysa oyunu sil
            if (currentGame.players.length === 1) {
                await supabase.from('games').delete().eq('id', currentGame.id);
            } else if (!currentGame.winner_id && !player.bankrupt_timestamp) {
                // Oyuncu iflas etmemişse, tüm parasını bankaya gönder
                await get().makeTransaction({
                    gameId: currentGame.id,
                    type: 'toBank',
                    amount: player.balance,
                    fromUserId: userId
                });
            }

            // Kullanıcının current_game_id'sini temizle
            await supabase
                .from('users')
                .update({ current_game_id: null })
                .eq('id', userId);

            // Realtime kanalını kapat
            const channel = get().realtimeChannel;
            if (channel) {
                supabase.removeChannel(channel);
            }

            set({ currentGame: null, realtimeChannel: null });
            return { success: true };
        } catch (error) {
            console.error('Leave game error:', error);
            return { success: false, error: error.message };
        }
    },

    startGame: async (gameId) => {
        try {
            const { error } = await supabase
                .from('games')
                .update({ starting_timestamp: new Date().toISOString() })
                .eq('id', gameId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Start game error:', error);
            return { success: false, error: error.message };
        }
    },

    makeTransaction: async ({ gameId, type, amount, fromUserId = null, toUserId = null }) => {
        console.log('makeTransaction started:', { gameId, type, amount, fromUserId, toUserId });
        try {
            const { data: game, error: fetchError } = await supabase
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single();

            if (fetchError || !game) {
                console.error('Fetch game error:', fetchError);
                throw new Error('Oyun bulunamadı');
            }

            const timestamp = new Date().toISOString();
            let updatedPlayers = [...game.players];
            let updatedFreeParkingMoney = game.free_parking_money;

            // İşlem tipine göre bakiyeleri güncelle
            switch (type) {
                case 'fromBank':
                    if (!toUserId) throw new Error('Alıcı belirtilmedi');
                    updatedPlayers = updatedPlayers.map(p =>
                        p.user_id === toUserId
                            ? { ...p, balance: p.balance + amount }
                            : p
                    );
                    break;

                case 'toBank':
                    if (!fromUserId) throw new Error('Gönderen belirtilmedi');
                    updatedPlayers = updatedPlayers.map(p =>
                        p.user_id === fromUserId
                            ? { ...p, balance: p.balance - amount }
                            : p
                    );
                    break;

                case 'toPlayer':
                    if (!fromUserId || !toUserId) throw new Error('Gönderen veya alıcı belirtilmedi');
                    updatedPlayers = updatedPlayers.map(p => {
                        if (p.user_id === fromUserId) {
                            return { ...p, balance: p.balance - amount };
                        } else if (p.user_id === toUserId) {
                            return { ...p, balance: p.balance + amount };
                        }
                        return p;
                    });
                    break;

                case 'toFreeParking':
                    if (!fromUserId) throw new Error('Gönderen belirtilmedi');
                    updatedPlayers = updatedPlayers.map(p =>
                        p.user_id === fromUserId
                            ? { ...p, balance: p.balance - amount }
                            : p
                    );
                    updatedFreeParkingMoney += amount;
                    break;

                case 'fromFreeParking':
                    if (!toUserId) throw new Error('Alıcı belirtilmedi');
                    updatedPlayers = updatedPlayers.map(p =>
                        p.user_id === toUserId
                            ? { ...p, balance: p.balance + updatedFreeParkingMoney }
                            : p
                    );
                    updatedFreeParkingMoney = 0;
                    break;

                case 'fromSalary':
                    if (!toUserId) throw new Error('Alıcı belirtilmedi');
                    updatedPlayers = updatedPlayers.map(p =>
                        p.user_id === toUserId
                            ? { ...p, balance: p.balance + game.salary }
                            : p
                    );
                    break;

                default:
                    throw new Error('Geçersiz işlem tipi');
            }

            // İflas kontrolü
            updatedPlayers = updatedPlayers.map(p => {
                if (p.balance <= 0 && !p.bankrupt_timestamp) {
                    return { ...p, bankrupt_timestamp: timestamp };
                }
                return p;
            });

            // İşlem geçmişine ekle
            // fromUserId ve toUserId undefined ise null yapıyoruz
            const transaction = {
                from_user_id: fromUserId || null,
                to_user_id: toUserId || null,
                amount: type === 'fromFreeParking' ? game.free_parking_money : amount,
                timestamp,
                type
            };

            const updatedHistory = [transaction, ...(game.transaction_history || [])];

            // Kazanan kontrolü
            const nonBankruptPlayers = updatedPlayers.filter(p => p.balance > 0);
            let winnerId = game.winner_id;
            let endingTimestamp = game.ending_timestamp;

            if (nonBankruptPlayers.length === 1 && updatedPlayers.length > 1 && !winnerId) {
                winnerId = nonBankruptPlayers[0].user_id;
                endingTimestamp = timestamp;
            }

            console.log('Updating game with:', {
                playersCount: updatedPlayers.length,
                historyCount: updatedHistory.length,
                freeParking: updatedFreeParkingMoney
            });

            // Oyunu güncelle
            const { error: updateError } = await supabase
                .from('games')
                .update({
                    players: updatedPlayers,
                    transaction_history: updatedHistory,
                    free_parking_money: updatedFreeParkingMoney,
                    winner_id: winnerId,
                    ending_timestamp: endingTimestamp
                })
                .eq('id', gameId);

            if (updateError) {
                console.error('Supabase update error:', updateError);
                throw updateError;
            }

            console.log('Transaction completed successfully');
            return { success: true };
        } catch (error) {
            console.error('Make transaction error:', error);
            return { success: false, error: error.message };
        }
    },

    cleanup: () => {
        const channel = get().realtimeChannel;
        if (channel) {
            supabase.removeChannel(channel);
        }
        set({ currentGame: null, realtimeChannel: null });
    },

    getRecentGames: async (limit = 10) => {
        try {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .not('winner_id', 'is', null)
                .not('ending_timestamp', 'is', null)
                .order('ending_timestamp', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, games: data || [] };
        } catch (error) {
            console.error('Get recent games error:', error);
            return { success: false, error: error.message, games: [] };
        }
    },

    getUserStats: async (userId) => {
        try {
            // Kullanıcının oynadığı tüm oyunları getir
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .not('winner_id', 'is', null)
                .not('ending_timestamp', 'is', null);

            if (error) throw error;

            // Kullanıcının oynadığı oyunları filtrele
            const userGames = (data || []).filter(game => 
                game.players.some(p => p.user_id === userId)
            );

            // İstatistikleri hesapla
            const totalGames = userGames.length;
            const wonGames = userGames.filter(game => game.winner_id === userId).length;
            
            const totalPlayTime = userGames.reduce((total, game) => {
                if (game.starting_timestamp && game.ending_timestamp) {
                    const start = new Date(game.starting_timestamp);
                    const end = new Date(game.ending_timestamp);
                    return total + (end - start);
                }
                return total;
            }, 0);

            return {
                success: true,
                stats: {
                    totalGames,
                    wonGames,
                    totalPlayTime
                }
            };
        } catch (error) {
            console.error('Get user stats error:', error);
            return {
                success: false,
                error: error.message,
                stats: {
                    totalGames: 0,
                    wonGames: 0,
                    totalPlayTime: 0
                }
            };
        }
    }
}));
