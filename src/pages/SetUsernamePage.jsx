import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Kullanıcı adı belirleme sayfası.
 * Yeni kayıt olan veya misafir girişi yapan kullanıcıların görünen adını belirlemesini sağlar.
 */
export default function SetUsernamePage() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { setUsername: updateUsername, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // İşlem sonrası dönülecek sayfa
    const from = location.state?.from?.pathname || '/';

    /**
     * Kullanıcı adını kaydeder ve ana sayfaya yönlendirir.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasyonlar
        if (!name.trim()) {
            toast.error('Lütfen adınızı girin');
            return;
        }

        if (name.length < 2) {
            toast.error('Ad en az 2 karakter olmalıdır');
            return;
        }

        if (name.length > 30) {
            toast.error('Ad en fazla 30 karakter olabilir');
            return;
        }

        setLoading(true);
        const result = await updateUsername(name.trim());
        setLoading(false);

        if (result.success) {
            toast.success('Hoş geldiniz!');
            navigate(from);
        } else {
            toast.error(result.error || 'Ad ayarlanamadı');
        }
    };

    return (
        <div className="username-page">
            <div className="username-container fade-in">
                <div className="username-icon">
                    <User size={48} />
                </div>

                <h1 className="username-title">
                    {user?.name ? 'Adınızı Değiştir' : 'Adınızı Girin'}
                </h1>
                <p className="username-subtitle">
                    Diğer oyuncular sizi bu isimle görecek
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-input username-input"
                            placeholder="Adınız (örn: Gökhan)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={30}
                            autoFocus
                            disabled={loading}
                        />
                        <div className="username-hint">
                            {name.length}/30 karakter
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={loading || !name.trim()}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                        ) : (
                            user?.name ? 'Güncelle' : 'Devam Et'
                        )}
                    </button>
                </form>

                <p className="username-footer">
                    İsterseniz daha sonra ayarlardan değiştirebilirsiniz
                </p>
            </div>
        </div>
    );
}
