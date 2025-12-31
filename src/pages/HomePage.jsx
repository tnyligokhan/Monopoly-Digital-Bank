import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { Plus, LogIn as LoginIcon, LogOut, User, Trophy, Clock, Gamepad2, Users, Menu, X, Info, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import CreateGameModal from '../components/CreateGameModal';
import JoinGameModal from '../components/JoinGameModal';
import AboutModal from '../components/AboutModal';
import Avatar from '../components/Avatar';

export default function HomePage() {
    const { user, signOut } = useAuthStore();
    const { getRecentGames, getUserStats } = useGameStore();
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
    const [recentGames, setRecentGames] = useState([]);
    const [stats, setStats] = useState({
        totalGames: 0,
        wonGames: 0,
        totalPlayTime: 0
    });

    useEffect(() => {
        // Eğer kullanıcı bir oyundaysa, oyun sayfasına yönlendir
        if (user?.current_game_id) {
            navigate(`/game/${user.current_game_id}`);
        }

        // Son oyunları ve istatistikleri yükle
        if (user?.id) {
            loadRecentGames();
            loadUserStats();
        }
    }, [user, navigate]);

    const loadRecentGames = async () => {
        const result = await getRecentGames(10);
        if (result.success) {
            setRecentGames(result.games);
        }
    };

    const loadUserStats = async () => {
        const result = await getUserStats(user.id);
        if (result.success) {
            setStats(result.stats);
        }
    };

    const handleSignOut = async () => {
        // Misafir kullanıcıysa onay iste
        if (user?.is_anonymous) {
            setShowSignOutConfirm(true);
            return;
        }

        // Normal kullanıcı için direkt çıkış yap
        const result = await signOut();
        if (result.success) {
            navigate('/login');
        } else {
            toast.error('Çıkış yapılamadı');
        }
    };

    const confirmSignOut = async () => {
        setShowSignOutConfirm(false);
        setShowSidebar(false);
        
        const result = await signOut();
        if (result.success) {
            navigate('/login');
        } else {
            toast.error('Çıkış yapılamadı');
        }
    };

    const handleChangeUsername = () => {
        setShowSidebar(false);
        navigate('/set-username');
    };

    const handleAbout = () => {
        setShowSidebar(false);
        setShowAboutModal(true);
    };

    const formatDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return '0dk';
        
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        
        if (hours > 0) {
            return `${hours}sa ${minutes}dk`;
        }
        return `${minutes}dk`;
    };

    const formatTotalDuration = (ms) => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        
        if (hours > 0) {
            return `${hours}sa ${minutes}dk`;
        }
        return `${minutes}dk`;
    };

    return (
        <div className="home-page">
            {/* Sidebar Overlay */}
            {showSidebar && (
                <div className="sidebar-overlay" onClick={() => setShowSidebar(false)}></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar ${showSidebar ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <button className="sidebar-close" onClick={() => setShowSidebar(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className="sidebar-user">
                    <Avatar user={user} size={56} />
                    <div className="sidebar-user-info">
                        <div className="sidebar-username">{user?.name}</div>
                        <div className="sidebar-user-email">Kullanıcı</div>
                    </div>
                </div>

                <div className="sidebar-divider"></div>

                <nav className="sidebar-nav">
                    <button className="sidebar-item" onClick={handleChangeUsername}>
                        <Edit3 size={20} />
                        <span>Adımı Değiştir</span>
                    </button>
                    <button className="sidebar-item" onClick={handleAbout}>
                        <Info size={20} />
                        <span>Uygulama Hakkında</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-item danger" onClick={handleSignOut}>
                        <LogOut size={20} />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </div>

            <div className="home-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <div className="logo-small">M</div>
                            <h1 className="header-title">Monopoly Digital Bank</h1>
                        </div>
                        <div className="header-right">
                            <button className="menu-btn" onClick={() => setShowSidebar(true)}>
                                <Menu size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="home-content fade-in">
                    {/* Karşılama Mesajı */}
                    <div className="welcome-section">
                        <h2 className="welcome-title">Merhaba, {user?.name}! 👋</h2>
                        <p className="welcome-subtitle">Yeni bir oyun başlatın veya mevcut bir oyuna katılın</p>
                    </div>
                    {/* İstatistikler */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Gamepad2 size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.totalGames}</div>
                                <div className="stat-label">Oynanan Oyun</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-success">
                                <Trophy size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats.wonGames}</div>
                                <div className="stat-label">Kazanılan Oyun</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-warning">
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{formatTotalDuration(stats.totalPlayTime)}</div>
                                <div className="stat-label">Toplam Süre</div>
                            </div>
                        </div>
                    </div>

                    {/* Oyun Butonları */}
                    <div className="game-actions">
                        <button
                            className="btn btn-primary btn-large game-action-btn"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus size={24} />
                            <div className="action-content">
                                <div className="action-title">Oyun Kur</div>
                                <div className="action-subtitle">Yeni bir oyun oluştur</div>
                            </div>
                        </button>

                        <button
                            className="btn btn-secondary btn-large game-action-btn"
                            onClick={() => setShowJoinModal(true)}
                        >
                            <LoginIcon size={24} />
                            <div className="action-content">
                                <div className="action-title">Oyuna Katıl</div>
                                <div className="action-subtitle">Mevcut oyuna katıl</div>
                            </div>
                        </button>
                    </div>

                    {/* Son Oyunlar */}
                    {recentGames && recentGames.length > 0 && (
                        <div className="recent-games">
                            <h2 className="section-title">Son Oyunlar</h2>
                            <div className="games-list">
                                {recentGames.map((game) => {
                                    const winner = game.players.find(p => p.user_id === game.winner_id);
                                    const playerNames = game.players.map(p => p.name).join(', ');
                                    const duration = formatDuration(game.starting_timestamp, game.ending_timestamp);
                                    
                                    return (
                                        <div key={game.id} className="game-card">
                                            <div className="game-card-header">
                                                <span className="game-id">#{game.id}</span>
                                                <Trophy size={16} color="var(--warning)" />
                                            </div>
                                            <div className="game-card-body">
                                                <div className="game-stat">
                                                    <span className="game-stat-label">Kazanan:</span>
                                                    <span className="game-stat-value">{winner?.name || 'Bilinmiyor'}</span>
                                                </div>
                                                <div className="game-stat">
                                                    <span className="game-stat-label">Oyuncular:</span>
                                                    <span className="game-stat-value" style={{ fontSize: '0.75rem' }}>
                                                        {playerNames}
                                                    </span>
                                                </div>
                                                <div className="game-stat">
                                                    <span className="game-stat-label">Süre:</span>
                                                    <span className="game-stat-value">{duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showCreateModal && (
                <CreateGameModal onClose={() => setShowCreateModal(false)} />
            )}

            {showJoinModal && (
                <JoinGameModal onClose={() => setShowJoinModal(false)} />
            )}

            {showAboutModal && (
                <AboutModal onClose={() => setShowAboutModal(false)} />
            )}

            {/* Misafir Çıkış Onay Modalı */}
            {showSignOutConfirm && (
                <div className="modal-overlay" onClick={() => setShowSignOutConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Emin misiniz?</h2>
                        </div>

                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                                Şu anda misafir hesabıyla giriş yaptınız. Çıkış yaptığınızda hesabınız ve tüm oyun geçmişiniz kalıcı olarak silinecektir.
                            </p>
                            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                                Sadece kullanıcı adınızı değiştirmek istiyorsanız, ana ekrandan "Adımı Değiştir" seçeneğini kullanabilirsiniz.
                            </p>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                💡 İstatistiklerinizi korumak için email ile kayıt olmanızı öneririz. Böylece farklı cihazlardan da hesabınıza erişebilirsiniz.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowSignOutConfirm(false)}
                            >
                                Vazgeç
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmSignOut}
                            >
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
