import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameStore } from '../store/gameStore';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JoinGameModal({ onClose }) {
    const { user } = useAuthStore();
    const { joinGame } = useGameStore();
    const navigate = useNavigate();

    const [gameId, setGameId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!gameId.trim()) {
            toast.error('Lütfen oyun kodunu girin');
            return;
        }

        setLoading(true);
        const result = await joinGame(gameId.trim(), user.id);
        setLoading(false);

        if (result.success) {
            toast.success('Oyuna katıldınız!');
            navigate(`/game/${gameId.toUpperCase()}`);
        } else {
            toast.error(result.error || 'Oyuna katılınamadı');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Oyuna Katıl</h2>
                    <button onClick={onClose} className="btn btn-small btn-ghost">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Oyun Kodu</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Örn: AB12"
                            value={gameId}
                            onChange={(e) => setGameId(e.target.value.toUpperCase())}
                            maxLength={4}
                            style={{ 
                                textAlign: 'center', 
                                fontSize: '1.5rem', 
                                fontWeight: '600', 
                                letterSpacing: '0.25em' 
                            }}
                            autoFocus
                            required
                        />
                        <p className="text-sm text-secondary mt-2">
                            Oyun kurucusundan 4 haneli oyun kodunu alın
                        </p>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-outline flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-secondary flex-1"
                            disabled={loading || !gameId.trim()}
                        >
                            {loading ? 'Katılınıyor...' : 'Katıl'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
