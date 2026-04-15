import { Menu, Bell, User } from 'lucide-react';

export default function Header({ toggleSidebar, sidebarCollapsed }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <header className="header">
            <div className="header-left">
                <button className="header-toggle" onClick={toggleSidebar}>
                    <Menu size={20} />
                </button>
                <div className="header-title">
                    <h1>Dashboard Monitoring</h1>
                    <span className="header-subtitle">Telkom Regional 4 Kalimantan</span>
                </div>
            </div>

            <div className="header-right">
                <button className="header-icon-btn">
                    <Bell size={18} />
                </button>
                <div className="header-user">
                    <div className="header-avatar">
                        <User size={16} />
                    </div>
                    <span className="header-username">{user.name || 'User'}</span>
                </div>
            </div>
        </header>
    );
}
