import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, TrendingUp, HeartPulse, Trophy,
    Upload, ShieldCheck,
} from 'lucide-react';

const menuSections = [
    {
        title: 'Executive View',
        items: [
            { path: '/', icon: LayoutDashboard, label: 'Home Dashboard', end: true },
            { path: '/revenue', icon: TrendingUp, label: 'Revenue Analytics' },
            { path: '/customer-care', icon: HeartPulse, label: 'Customer Care & NPS' },
            { path: '/leaderboard', icon: Trophy, label: 'Witel Leaderboard' },
        ],
    },
    {
        title: 'Data & Management',
        items: [
            { path: '/upload', icon: Upload, label: 'Upload Data Source' },
            { path: '/users', icon: ShieldCheck, label: 'User & Audit Log', adminOnly: true },
        ],
    },
];

export default function Sidebar({ isCollapsed }) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img
                        src="/logo-telkom.png"
                        alt="Telkom"
                        className="sidebar-logo-img"
                    />
                    {!isCollapsed && (
                        <div className="logo-text-block">
                            <span className="logo-text">Telkom Dashboard</span>
                            <span className="logo-sublabel">Regional 4 Kalimantan</span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuSections.map((section) => (
                    <div key={section.title} className="sidebar-section">
                        {!isCollapsed && <div className="sidebar-section-title">{section.title}</div>}
                        {section.items
                            .filter((it) => !it.adminOnly || isAdmin)
                            .map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <item.icon size={18} />
                                    {!isCollapsed && <span>{item.label}</span>}
                                </NavLink>
                            ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                {!isCollapsed && (
                    <div className="sidebar-footer-note">
                        <span>Dashboard Telkom TREG 4 Kalimantan</span>
                    </div>
                )}
            </div>
        </aside>
    );
}
