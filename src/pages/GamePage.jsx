import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { LogOut, Share2, Upload, Download, Building2, Wallet, Car, User, Clock, ArrowLeft, Trash2, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import TransactionModal from '../components/TransactionModal';
import GameEndModal from '../components/GameEndModal';
import { formatDisplayName } from '../utils/formatName';
import Avatar from '../components/Avatar';

/**
 * Oyunun ana ekranı. Realtime güncellemeleri, bakiye yönetimini,
 * transfer işlemlerini ve oyun akışını yönetir.
 */
export default function GamePage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { currentGame, subscribeToGame, leaveGame, startGame, joinGame, cleanup, makeTransaction, kickPlayer, disbandGame } = useGameStore();

    // UI States
    const [modalConfig, setModalConfig] = useState(null);
    const [showGameEndModal, setShowGameEndModal] = useState(false);
    const [hasTriedJoining, setHasTriedJoining] = useState(false);
    const [gameLoaded, setGameLoaded] = useState(false);

    /**
     * Sayfa yüklendiğinde oyun kanalına abone olur.
     * Sayfadan ayrıldığında kanaldan ayrılır.
     */
    useEffect(() => {
        let isMounted = true;

        if (gameId) {
            subscribeToGame(gameId);

            // 5 saniye içinde oyun verisi gelmezse hata ver ve geri dön
            const timeout = setTimeout(() => {
                if (isMounted && !useGameStore.getState().currentGame) {
                    toast.error('Oyun bulunamadı veya bağlantı hatası');
                    navigate('/');
                }
            }, 5000);

            return () => {
                clearTimeout(timeout);
                isMounted = false;
                cleanup();
            };
        }
    }, [gameId]);

    /**
     * Kullanıcı oyuna henüz dahil değilse otomatik katılma işlemi yapar.
     */
    useEffect(() => {
        if (currentGame && user && !currentGame.starting_timestamp && !hasTriedJoining) {
            const isPlayer = currentGame.players.some(p => p.user_id === user.id);
            if (!isPlayer) {
                setHasTriedJoining(true);
                joinGame(gameId, user.id).then(result => {
                    if (result.success) {
                        toast.success('Oyuna giriş yapıldı');
                    } else {
                        toast.error(result.error);
                    }
                });
            }
        } else if (currentGame && user && hasTriedJoining) {
            // Eğer daha önce katılmayı denediysek (veya katıldıysak) ve şu an listede yoksak -> Atıldık
            const isPlayer = currentGame.players.some(p => p.user_id === user.id);
            if (!isPlayer) {
                // Temizlik yap ve anasayfaya yönlendir
                cleanup();
                useAuthStore.getState().setCurrentGameId(null);
                toast.error('Oyundan atıldınız!');
                navigate('/');
            }
        }
    }, [currentGame, user, gameId, hasTriedJoining]);

    /**
     * Oyun silindiğinde ana sayfaya yönlendir.
     */
    useEffect(() => {
        if (currentGame) {
            setGameLoaded(true);
        } else if (gameLoaded && !currentGame) {
            toast.error('Oyun kurucu tarafından sonlandırıldı');
            navigate('/');
        }
    }, [currentGame, gameLoaded]);

    /**
     * Kazanan belirlendiğinde oyun sonu modalını açar.
     */
    useEffect(() => {
        if (currentGame?.winner_id && !showGameEndModal) {
            setShowGameEndModal(true);
        }
    }, [currentGame?.winner_id]);

    /**
     * Oyundan ayrılma işlemi.
     */
    const handleLeaveGame = async () => {
        if (confirm('Oyundan ayrılmak istediğinize emin misiniz?')) {
            const result = await leaveGame(user.id);
            if (result.success) {
                navigate('/');
            }
        }
    };

    /**
     * Oyunu ve lobiyi tamamen dağıtma (Sadece Kurucu).
     */
    const handleDisbandGame = async () => {
        if (confirm('DİKKAT: Oyunu tamamen bitirmek ve herkesi atmak istediğinize emin misiniz?')) {
            const result = await disbandGame(gameId);
            if (result.success) {
                toast.success('Oyun dağıtıldı');
                navigate('/');
            } else {
                toast.error(result.error);
            }
        }
    };

    /**
     * Oyunu kurucu tarafından resmen başlatır.
     */
    const handleStartGame = async () => {
        const result = await startGame(gameId);
        if (result.success) {
            toast.success('Oyun başladı!');
        } else {
            toast.error('Oyun başlatılamadı');
        }
    };

    /**
     * Oyun linkini veya kodunu paylaşır.
     */
    const handleShare = async () => {
        const gameUrl = `${window.location.origin}/game/${gameId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Monopoly Oyununa Katıl',
                    text: `Oyun Kodu: ${gameId}`,
                    url: gameUrl
                });
            } catch {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(gameUrl);
            toast.success('Oyun linki kopyalandı!');
        }
    };

    /**
     * İşlem modalını açar veya hızlı maaş ödemesini yapar.
     */
    const openTransactionModal = (type, targetId = null) => {
        if (type === 'fromSalary') {
            const loadingToast = toast.loading('Maaş yatırılıyor...');
            makeTransaction({
                gameId: currentGame.id,
                type: 'fromSalary',
                amount: currentGame.salary,
                toUserId: user.id
            }).then((res) => {
                toast.dismiss(loadingToast);
                if (res.success) toast.success('Maaş alındı!');
                else toast.error(`Hata: ${res.error || 'İşlem başarısız'}`);
            });
            return;
        }

        setModalConfig({ type, targetId });
    };

    /**
     * Oyuncu atma işlemi
     */
    const handleKickPlayer = async (targetId, targetName) => {
        if (window.confirm(`${targetName} adlı oyuncuyu oyundan atmak istediğinize emin misiniz?`)) {
            const result = await kickPlayer(gameId, targetId);
            if (result.success) {
                toast.success(`${targetName} oyundan atıldı`);
            } else {
                toast.error(`Hata: ${result.error}`);
            }
        }
    };

    // Yükleniyor durumu
    if (!currentGame) {
        return (
            <div className="game-page">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    const isCreator = currentGame.players.find(p => p.user_id === user.id)?.is_game_creator;
    const hasStarted = currentGame.starting_timestamp !== null;

    // Lobi / Bekleme Ekranı
    if (!hasStarted || currentGame.players.length < 2) {
        return (
            <div className="game-page">
                <header className="game-header">
                    <div className="game-header-left">
                        <button className="icon-btn" onClick={() => navigate('/')}><ArrowLeft size={24} /></button>
                        <span className="game-code">#{gameId}</span>
                    </div>
                    {isCreator ? (
                        <button className="icon-btn" onClick={handleDisbandGame} style={{ color: 'var(--danger)' }} title="Oyunu Dağıt">
                            <XCircle size={24} />
                        </button>
                    ) : (
                        <button className="icon-btn" onClick={handleLeaveGame} title="Ayrıl">
                            <LogOut size={24} />
                        </button>
                    )}
                </header>
                <div className="container" style={{ paddingTop: 'var(--spacing-2xl)' }}>
                    <div className="lobby-card fade-in">
                        <h2 className="text-center mb-4">Lobi: #{gameId}</h2>
                        <div className="qr-container">
                            <QRCodeSVG value={`${window.location.origin}/game/${gameId}`} size={200} />
                        </div>
                        <div className="players-list">
                            <h3 className="mb-3">Oyuncular ({currentGame.players.length})</h3>
                            {currentGame.players.map((player, index) => (
                                <div key={index} className="player-item">
                                    <Avatar
                                        user={{ id: player.user_id, name: player.name, photo_url: player.photo_url }}
                                        size={40}
                                    />
                                    <span className="player-name">{player.name}</span>
                                    {isCreator && player.user_id !== user.id && (
                                        <button
                                            className="icon-btn"
                                            onClick={() => handleKickPlayer(player.user_id, player.name)}
                                            style={{ marginLeft: 'auto', color: 'var(--danger)', padding: '4px' }}
                                            title="Oyundan At"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {isCreator && currentGame.players.length >= 2 && (
                            <button className="btn btn-success btn-large mt-4" style={{ width: '100%' }} onClick={handleStartGame}>
                                Oyunu Başlat
                            </button>
                        )}
                        <button className="btn btn-outline mt-2" style={{ width: '100%' }} onClick={handleShare}>
                            <Share2 size={16} /> Davet Et
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const otherPlayers = currentGame.players.filter(p => p.user_id !== user.id);
    const currentPlayer = currentGame.players.find(p => p.user_id === user.id);

    return (
        <div className="game-page">
            <header className="game-header">
                <div className="game-header-left">
                    <button className="icon-btn" onClick={() => navigate('/')}><ArrowLeft size={24} /></button>
                    <span className="game-code">#{gameId}</span>
                </div>
                {isCreator ? (
                    <button className="icon-btn" onClick={handleDisbandGame} style={{ color: 'var(--danger)' }} title="Oyunu Bitir">
                        <XCircle size={24} />
                    </button>
                ) : (
                    <button className="icon-btn" onClick={handleLeaveGame} title="Ayrıl">
                        <LogOut size={24} />
                    </button>
                )}
            </header>

            {/* Bakiye Gösterimi */}
            <div className="balance-section">
                <h1 className="main-balance" style={currentPlayer?.balance <= 0 ? { color: 'var(--danger)' } : {}}>
                    ${currentPlayer?.balance?.toLocaleString()}
                </h1>
                {currentPlayer?.balance <= 0 && (
                    <div className="bankrupt-badge">💸 İflas ettiniz</div>
                )}
            </div>

            <div className="scrollable-content">
                {/* Ödeme Bölümü */}
                <div className="section-header">
                    <span>ÖDE</span>
                    <Upload size={16} />
                </div>

                <div className="action-list">
                    {otherPlayers.map(player => (
                        <div key={player.user_id} style={{ position: 'relative', marginBottom: '8px' }}>
                            <button
                                className="action-item"
                                onClick={() => openTransactionModal('toPlayer', player.user_id)}
                                disabled={player.bankrupt_timestamp !== null}
                                style={{
                                    width: '100%',
                                    marginBottom: 0,
                                    ...(player.bankrupt_timestamp ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                                }}
                            >
                                <div className="player-info">
                                    <Avatar
                                        user={{ id: player.user_id, name: player.name, photo_url: player.photo_url }}
                                        size={40}
                                        showBorder={true}
                                    />
                                    <div>
                                        <span className="player-name">{formatDisplayName(player.name)}</span>
                                        {player.bankrupt_timestamp && (
                                            <div className="bankrupt-status">💸 Bankrupt</div>
                                        )}
                                    </div>
                                </div>
                                <span className="player-balance" style={player.bankrupt_timestamp ? { color: 'var(--danger)' } : {}}>
                                    ${player.balance.toLocaleString()}
                                </span>
                            </button>
                            {isCreator && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleKickPlayer(player.user_id, player.name);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        right: '-10px',
                                        top: '-10px',
                                        background: 'var(--danger)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        zIndex: 10,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                    title="Oyundan At"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button className="action-item" onClick={() => openTransactionModal('toBank')}>
                        <div className="player-info">
                            <div className="player-avatar bank-avatar"><Building2 size={20} color="white" /></div>
                            <span className="player-name">Banka</span>
                        </div>
                    </button>
                    {currentGame.enable_free_parking && (
                        <button className="action-item" onClick={() => openTransactionModal('toFreeParking')}>
                            <div className="player-info">
                                <div className="player-avatar parking-avatar"><Car size={20} color="white" /></div>
                                <span className="player-name">Otopark</span>
                            </div>
                        </button>
                    )}
                </div>

                {/* Alma Bölümü */}
                <div className="section-header mt-4">
                    <span>AL</span>
                    <Download size={16} />
                </div>

                <div className="grid-actions">
                    <button className="grid-btn" onClick={() => openTransactionModal('fromBank')}>
                        <Building2 size={24} />
                        <span>Banka</span>
                    </button>
                    <button className="grid-btn" onClick={() => openTransactionModal('fromSalary')}>
                        <Wallet size={24} />
                        <span>Maaş</span>
                    </button>
                    {currentGame.enable_free_parking && (
                        <button className="grid-btn" onClick={() => openTransactionModal('fromFreeParking')}>
                            <Car size={24} />
                            <span>Otopark</span>
                        </button>
                    )}
                </div>

                {/* İşlem Geçmişi */}
                <div className="section-header mt-4">
                    <span>GEÇMİŞ</span>
                    <Clock size={16} />
                </div>

                <div className="history-list">
                    {currentGame.transaction_history?.slice(0, 50).map((tx, index) => {
                        const fromPlayer = currentGame.players.find(p => p.user_id === tx.from_user_id);
                        const toPlayer = currentGame.players.find(p => p.user_id === tx.to_user_id);

                        const fromName = fromPlayer ? formatDisplayName(fromPlayer.name) : 'Bilinmeyen';
                        const toName = toPlayer ? formatDisplayName(toPlayer.name) : 'Bilinmeyen';

                        const isMyTransaction = tx.from_user_id === user.id || tx.to_user_id === user.id;
                        const isIncoming = tx.to_user_id === user.id;
                        const isOutgoing = tx.from_user_id === user.id;

                        let message = '';
                        let icon = <Clock size={16} color="#90A4AE" />;
                        let amountClass = 'text-secondary';

                        switch (tx.type) {
                            case 'fromSalary':
                                message = `${toName} maaş aldı`;
                                icon = <Wallet size={16} color="#FF9800" />;
                                if (isIncoming) amountClass = 'text-success';
                                break;

                            case 'fromBank':
                                message = `${toName} bankadan çekti`;
                                icon = <Building2 size={16} color="#4CAF50" />;
                                if (isIncoming) amountClass = 'text-success';
                                break;

                            case 'toBank':
                                message = `${fromName} bankaya ödedi`;
                                icon = <Building2 size={16} color="#F44336" />;
                                if (isOutgoing) amountClass = 'text-danger';
                                break;

                            case 'toFreeParking':
                                message = `${fromName} otoparka ödedi`;
                                icon = <Car size={16} color="#9C27B0" />;
                                if (isOutgoing) amountClass = 'text-danger';
                                break;

                            case 'fromFreeParking':
                                message = `${toName} otoparkı topladı`;
                                icon = <Car size={16} color="#00BCD4" />;
                                if (isIncoming) amountClass = 'text-success';
                                break;

                            case 'toPlayer':
                                message = `${fromName} ➜ ${toName}`;
                                icon = <Upload size={16} color="#2196F3" />;
                                if (isIncoming) amountClass = 'text-success';
                                else if (isOutgoing) amountClass = 'text-danger';
                                break;

                            default:
                                message = 'Bilinmeyen işlem';
                        }

                        let amountPrefix = '';
                        if (isIncoming) amountPrefix = '+';
                        else if (isOutgoing) amountPrefix = '-';

                        return (
                            <div key={index} className="history-item" style={{ opacity: isMyTransaction ? 1 : 0.7 }}>
                                <div className="history-icon" style={{ minWidth: '24px' }}>
                                    {icon}
                                </div>
                                <div className="history-details">
                                    <div className="history-text" style={{ fontSize: '14px', fontWeight: isMyTransaction ? '600' : '400' }}>
                                        {message}
                                    </div>
                                    <div className="history-time" style={{ fontSize: '11px', color: '#64748B' }}>
                                        {new Date(tx.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <div className={`history-amount ${amountClass}`} style={{ fontWeight: 'bold' }}>
                                    {amountPrefix}${tx.amount.toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modallar */}
            {modalConfig && (
                <TransactionModal
                    game={currentGame}
                    currentPlayer={currentPlayer}
                    initialConfig={modalConfig}
                    onClose={() => setModalConfig(null)}
                />
            )}

            {showGameEndModal && currentGame?.winner_id && (
                <GameEndModal
                    game={currentGame}
                    currentPlayer={currentPlayer}
                    winner={currentGame.players.find(p => p.user_id === currentGame.winner_id)}
                    onClose={() => setShowGameEndModal(false)}
                    onLeaveGame={() => leaveGame(user.id)}
                />
            )}
        </div>
    );
}
