import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn, Mail, Lock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const { signInAnonymously, signInWithEmail, signUpWithEmail } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleAnonymousSignIn = async () => {
        setLoading(true);
        const result = await signInAnonymously();

        if (result.success) {
            // State güncellemesini bekle
            await new Promise(resolve => setTimeout(resolve, 100));
            navigate('/set-username', { state: { from: location.state?.from } });
        } else {
            toast.error(result.error || 'Giriş yapılamadı');
        }

        setLoading(false);
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();

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
            const fullName = `${firstName.trim()} ${lastName.trim()}`;
            const result = await signUpWithEmail(email, password, fullName);
            setLoading(false);

            if (result.success) {
                toast.success('Kayıt başarılı! Email adresinizi kontrol edin.');
                setIsSignUp(false);
                setEmail('');
                setPassword('');
                setFirstName('');
                setLastName('');
            } else {
                toast.error(result.error || 'Kayıt olunamadı');
            }
        } else {
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
                    <div className="logo-circle">
                        <span className="logo-text">M</span>
                    </div>
                </div>

                <h1 className="login-title">Monopoly Digital Bank</h1>
                <p className="login-subtitle">
                    {isSignUp ? 'Hesap oluştur ve harcamalarını yönet' : 'Monopoly oyununda dijital bankacılık deneyimi'}
                </p>

                <form onSubmit={handleEmailAuth} className="login-buttons">
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

                <p className="login-footer">
                    {isSignUp ? (
                        '📧 Kayıt olduktan sonra email adresinize onay linki gönderilecektir'
                    ) : (
                        '⚠️ Misafir girişte istatistikleriniz sadece bu cihazda saklanır'
                    )}
                </p>
            </div>
        </div>
    );
}
