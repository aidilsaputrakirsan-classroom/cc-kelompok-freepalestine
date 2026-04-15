import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { MainLayout } from './components/Layout';
import LoginPage from './pages/Auth/LoginPage';
import HomeDashboard from './pages/Dashboard/HomeDashboard';
import RevenuePage from './pages/Revenue/RevenuePage';
import InboxPage from './pages/Inbox/InboxPage';
import './index.css';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function updateActivity() {
    localStorage.setItem('lastActivityTime', Date.now().toString());
}

function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('access_token');

    const doLogout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivityTime');
        navigate('/login', { replace: true });
    }, [navigate]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach((e) => window.addEventListener(e, updateActivity));
        updateActivity();

        const interval = setInterval(() => {
            const last = parseInt(localStorage.getItem('lastActivityTime') || '0', 10);
            if (Date.now() - last > SESSION_TIMEOUT_MS) doLogout();
        }, 60000);

        return () => {
            events.forEach((e) => window.removeEventListener(e, updateActivity));
            clearInterval(interval);
        };
    }, [isLoggedIn, doLogout]);

    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route index element={<HomeDashboard />} />
                    <Route path="revenue" element={<RevenuePage />} />
                    <Route path="inbox" element={<InboxPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
