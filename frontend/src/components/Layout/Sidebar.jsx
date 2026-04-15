import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Inbox, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { path: '/revenue', icon: TrendingUp, label: 'Revenue' },
    { path: '/inbox', icon: Inbox, label: 'Inbox' },
];

export default function Sidebar({ isCollapsed }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">T</span>
                    {!isCollapsed && <span className="logo-text">Telkom Dashboard</span>}
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-link logout-btn" onClick={handleLogout}>
                    <LogOut size={20} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}
