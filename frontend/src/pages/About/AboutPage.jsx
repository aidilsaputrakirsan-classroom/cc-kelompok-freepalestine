import {
    Info, Users, Layers, GitBranch, Database, Server, Globe, ShieldCheck,
    Cpu, Package, Github, BookOpen,
} from 'lucide-react';

const team = [
    { name: 'Ariel',  nim: '-', role: 'Lead Backend & Lead Frontend' },
    { name: '—',      nim: '-', role: 'Lead DevOps' },
    { name: '—',      nim: '-', role: 'Lead QA & Docs' },
    { name: '—',      nim: '-', role: 'Lead CI/CD' },
];

const techStack = [
    { icon: Server,  label: 'Backend',   value: 'FastAPI (Python) + SQLAlchemy ORM' },
    { icon: Database,label: 'Database',  value: 'PostgreSQL 16' },
    { icon: Globe,   label: 'Frontend',  value: 'React 18 + Vite + Recharts' },
    { icon: Package, label: 'Container', value: 'Docker + Docker Compose' },
    { icon: ShieldCheck, label: 'Auth',  value: 'JWT (python-jose) + bcrypt' },
    { icon: Cpu,     label: 'CI/CD',     value: 'GitHub Actions (planned)' },
];

const modules = [
    { id: '01', title: 'Pengantar Cloud Computing & Arsitektur Aplikasi' },
    { id: '02', title: 'REST API dengan FastAPI' },
    { id: '03', title: 'Frontend SPA dengan React + Vite' },
    { id: '04', title: 'Integrasi Full-stack (Frontend ↔ Backend)' },
    { id: '05', title: 'Containerization dengan Docker' },
    { id: '06', title: 'Docker Compose & Orkestrasi Lokal' },
    { id: '07', title: 'Database Persistence & Volume' },
    { id: '09', title: 'Git Workflow & Branching Strategy' },
];

export default function AboutPage() {
    return (
        <div className="page-container about-page" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Header */}
            <div
                className="page-header"
                style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '18px 20px', borderRadius: 'var(--radius)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)', marginBottom: 18,
                }}
            >
                <div
                    style={{
                        width: 52, height: 52, borderRadius: 12, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff',
                    }}
                >
                    <Info size={24} />
                </div>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Tentang Aplikasi
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
                        Dashboard Executive - Telkom Regional 4 Kalimantan · Cloud Computing ITK
                    </p>
                </div>
            </div>

            {/* Deskripsi */}
            <div
                style={{
                    padding: 18, borderRadius: 'var(--radius)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)', marginBottom: 18,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <BookOpen size={18} color="var(--accent-blue)" />
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Deskripsi Proyek
                    </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7 }}>
                    Aplikasi ini adalah <strong>dashboard monitoring revenue &amp; customer care</strong> untuk
                    Telkom Regional 4 Kalimantan. Dibangun sebagai tugas besar mata kuliah Komputasi Awan
                    (Sistem Informasi - Institut Teknologi Kalimantan) dengan prinsip cloud-native:
                    stateless backend, containerization, dan pemisahan concern antara frontend &amp; backend.
                    Semua perhitungan KPI, trend, dan leaderboard dilakukan murni lewat CRUD &amp; agregasi
                    data (tanpa AI/ML pihak ketiga).
                </p>
            </div>

            {/* Tech Stack */}
            <div
                style={{
                    padding: 18, borderRadius: 'var(--radius)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)', marginBottom: 18,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Layers size={18} color="var(--accent-cyan)" />
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Tech Stack
                    </h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                        gap: 10,
                    }}
                >
                    {techStack.map((t) => {
                        const Icon = t.icon;
                        return (
                            <div
                                key={t.label}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 10,
                                    padding: 12, borderRadius: 10,
                                    background: 'var(--bg-hover)',
                                    border: '1px solid var(--border-color)',
                                }}
                            >
                                <Icon size={18} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
                                <div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                        {t.label}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                                        {t.value}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tim */}
            <div
                style={{
                    padding: 18, borderRadius: 'var(--radius)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)', marginBottom: 18,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Users size={18} color="var(--accent-green)" />
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Tim Pengembang
                    </h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: 64 }}>#</th>
                                <th>Nama</th>
                                <th>NIM</th>
                                <th>Peran</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map((m, i) => (
                                <tr key={i}>
                                    <td>{i + 1}</td>
                                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                                    <td>{m.nim}</td>
                                    <td>
                                        <span
                                            style={{
                                                display: 'inline-block', padding: '3px 10px',
                                                borderRadius: 999, fontSize: 11, fontWeight: 600,
                                                background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)',
                                                border: '1px solid rgba(59,130,246,0.25)',
                                            }}
                                        >
                                            {m.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modul Referensi */}
            <div
                style={{
                    padding: 18, borderRadius: 'var(--radius)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)', marginBottom: 18,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <GitBranch size={18} color="var(--accent-purple)" />
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Modul Referensi yang Sudah Diterapkan
                    </h2>
                </div>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: 8,
                    }}
                >
                    {modules.map((m) => (
                        <div
                            key={m.id}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 8,
                                background: 'var(--bg-hover)', border: '1px solid var(--border-color)',
                            }}
                        >
                            <div
                                style={{
                                    width: 32, height: 32, borderRadius: 6,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'var(--accent-blue)', color: '#fff',
                                    fontWeight: 700, fontSize: 12, flexShrink: 0,
                                }}
                            >
                                {m.id}
                            </div>
                            <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{m.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Repository info */}
            <div
                style={{
                    padding: 14, borderRadius: 'var(--radius)',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                }}
            >
                <Github size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    Repository:
                </span>
                <a
                    href="https://github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        fontSize: 12.5, color: 'var(--accent-blue)',
                        textDecoration: 'none', fontWeight: 600,
                        wordBreak: 'break-all',
                    }}
                >
                    github.com/aidilsaputrakirsan-classroom/cc-kelompok-freepalestine
                </a>
            </div>
        </div>
    );
}
