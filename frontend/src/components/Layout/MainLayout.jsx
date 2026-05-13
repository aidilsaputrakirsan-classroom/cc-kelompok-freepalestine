import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className={`app-container ${sidebarCollapsed ? 'sidebar-hidden' : ''}`}>
            <Sidebar isCollapsed={sidebarCollapsed} />
            <main className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
                <Header toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} sidebarCollapsed={sidebarCollapsed} />
                <Outlet />
            </main>
        </div>
    );
}
