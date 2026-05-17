import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';

const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { num1, num2, answer: num1 + num2 };
};

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setCaptchaInput('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email dan password harus diisi');
            return;
        }

        if (parseInt(captchaInput) !== captcha.answer) {
            setError('Jawaban CAPTCHA salah');
            refreshCaptcha();
            return;
        }

        setLoading(true);
        setLoadingProgress(0);

        const progressInterval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 100) { clearInterval(progressInterval); return 100; }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            const response = await authApi.login({ email, password });
            clearInterval(progressInterval);
            setLoadingProgress(100);

            setTimeout(() => {
                localStorage.setItem('access_token', response.access_token);
                localStorage.setItem('user', JSON.stringify(response.user));
                navigate('/');
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setLoading(false);
            setLoadingProgress(0);
            setError(err.response?.data?.detail || 'Login gagal, periksa kredensial Anda');
            refreshCaptcha();
        }
    };

    return (
        <div className="login-page">
            {loading && (
                <div className="login-loading-overlay">
                    <div className="loading-content">
                        <div className="loading-logo">
                            <img src="/logo-telkom.png" alt="Telkom" className="loading-logo-img" />
                        </div>
                        <div className="loading-bar">
                            <div className="loading-bar-fill" style={{ width: `${Math.min(loadingProgress, 100)}%` }} />
                        </div>
                        <p className="loading-text">
                            {loadingProgress < 30 && 'Memverifikasi kredensial...'}
                            {loadingProgress >= 30 && loadingProgress < 60 && 'Memuat data pengguna...'}
                            {loadingProgress >= 60 && loadingProgress < 90 && 'Menyiapkan dashboard...'}
                            {loadingProgress >= 90 && 'Hampir selesai...'}
                        </p>
                    </div>
                </div>
            )}

            <div className="login-container">
                <div className="login-header">
                    <div className="login-logo">
                        <img src="/logo-telkom.png" alt="Telkom" className="login-logo-img" />
                    </div>
                    <h1>Dashboard Telkom</h1>
                    <p className="login-tagline">Monitoring Regional 4 Kalimantan</p>
                </div>

                <div className="login-error-wrapper">
                    {error && <div className="login-error">{error}</div>}
                </div>

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="login-fields-row">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@student.itk.ac.id" autoComplete="email" disabled={loading} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan password" autoComplete="current-password" disabled={loading} />
                        </div>
                    </div>

                    <div className="login-captcha-row">
                        <div className="captcha-section">
                            <label>Verifikasi Keamanan</label>
                            <div className="captcha-box">
                                <div className="captcha-question">
                                    <span className="captcha-num">{captcha.num1}</span>
                                    <span className="captcha-op">+</span>
                                    <span className="captcha-num">{captcha.num2}</span>
                                    <span className="captcha-eq">=</span>
                                    <span className="captcha-q">?</span>
                                </div>
                                <button type="button" className="captcha-refresh" onClick={refreshCaptcha} disabled={loading}>↻</button>
                            </div>
                            <input type="number" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)}
                                placeholder="Jawaban" disabled={loading} className="captcha-input" />
                        </div>
                        <div className="login-button-section">
                            <button type="submit" className="login-button" disabled={loading}>
                                {loading ? 'Memproses...' : 'Login'}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="login-footer">
                    <p>Telkom Regional 4 Kalimantan</p>
                    <p className="copyright">© 2025 Cloud Computing · ITK</p>
                </div>
            </div>
        </div>
    );
}
