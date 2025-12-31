import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn, Mail, Lock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../assets/logo.svg';
import logoDark from '../assets/logo-dark.svg';

/**
 * Giriş ve Kayıt sayfası.
 * Anonim giriş, e-posta/şifre ile giriş ve kayıt işlemlerini yönetir.
 */
export default function LoginPage() {
    // UI State yönetimi
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Form State yönetimi
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Stores ve hooks
    const { signInAnonymously, signInWithEmail, signUpWithEmail } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Giriş yapıldıktan sonra yönlendirilecek sayfa (varsayılan: ana sayfa)
    const from = location.state?.from?.pathname || '/';

    /**
     * Misafir oyuncu olarak hızlı giriş yapar.
     */
    const handleAnonymousSignIn = async () => {
        setLoading(true);
        const result = await signInAnonymously();

        if (result.success) {
            // Küçük bir gecikme ile kullanıcı adı belirleme sayfasına yönlendir
            await new Promise(resolve => setTimeout(resolve, 100));
            navigate('/set-username', { state: { from: location.state?.from } });
        } else {
            toast.error(result.error || 'Giriş yapılamadı');
        }

        setLoading(false);
    };

    /**
     * E-posta ve şifre ile giriş veya kayıt işlemini yönetir.
     */
    const handleEmailAuth = async (e) => {
        e.preventDefault();

        // Validasyonlar
        if (!email || !password) {
            toast.error('Lütfen tüm alanları doldurun');
            return;
        }

        if (isSignUp && (!firstName || !lastName)) {
            toast.error('Lütfen ad ve soyad girin');
            return;
        }

        if (password.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setLoading(true);

        if (isSignUp) {
            // Kayıt olma işlemi
            const fullName = `${firstName.trim()} ${lastName.trim()}`;
            const result = await signUpWithEmail(email, password, fullName);
            setLoading(false);

            if (result.success) {
                toast.success('Kayıt başarılı! Email adresinizi kontrol edin.');
                setIsSignUp(false);
                // Formu temizle
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
            } else {
                toast.error(result.error || 'Kayıt olunamadı');
            }
        } else {
            // Giriş yapma işlemi
            const result = await signInWithEmail(email, password);
            setLoading(false);

            if (result.success) {
                navigate(from);
            } else {
                toast.error(result.error || 'Giriş yapılamadı');
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-container fade-in">
                <div className="login-logo">
                    <img src={logo} alt="Monopoly Digital Bank" className="app-logo light-mode-logo" />
                    <img src={logoDark} alt="Monopoly Digital Bank" className="app-logo dark-mode-logo" />
                </div>

                <p className="login-subtitle">
                    {isSignUp ? 'Hesap oluştur ve harcamalarını yönet' : 'Monopoly oyununda dijital bankacılık deneyimi'}
                </p>

                <form onSubmit={handleEmailAuth} className="login-buttons">
                    {/* Kayıt Modu Alanları */}
                    {isSignUp && (
                        <>
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <UserIcon size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Ad"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <div className="input-with-icon">
                                    <UserIcon size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Soyad"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Ortak Alanlar */}
                    <div className="form-group">
                        <div className="input-with-icon">
                            <Mail size={20} className="input-icon" />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-with-icon">
                            <Lock size={20} className="input-icon" />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Şifre (min. 6 karakter)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-large"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                        ) : (
                            <>
                                <Mail size={20} />
                                {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
                            </>
                        )}
                    </button>

                    {/* Mod Değiştirme Butonu */}
                    <button
                        type="button"
                        className="btn btn-ghost btn-large"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setEmail('');
                            setPassword('');
                            setFirstName('');
                            setLastName('');
                        }}
                        disabled={loading}
                    >
                        {isSignUp ? 'Zaten hesabın var mı? Giriş yap' : 'Hesabın yok mu? Kayıt ol'}
                    </button>

                    <div className="divider">
                        <span>veya</span>
                    </div>

                    {/* Misafir Girişi */}
                    <button
                        type="button"
                        className="btn btn-outline btn-large"
                        onClick={handleAnonymousSignIn}
                        disabled={loading}
                    >
                        <LogIn size={20} />
                        Misafir Olarak Devam Et
                    </button>
                </form>

                <div className="login-footer">
                    {isSignUp ? (
                        <p>📧 Kayıt olduktan sonra email adresinize onay linki gönderilecektir</p>
                    ) : (
                        <p>⚠️ Misafir girişte istatistikleriniz sadece bu cihazda saklanır</p>
                    )}
                </div>
            </div>
        </div>
    );
}
