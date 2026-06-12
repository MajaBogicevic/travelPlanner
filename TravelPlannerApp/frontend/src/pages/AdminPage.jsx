import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/adminService';

export default function AdminPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tab, setTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState('');
    const [userFilter, setUserFilter] = useState(null);
    const [deletingPlanId, setDeletingPlanId] = useState(null);

    useEffect(() => {
        Promise.all([
            adminService.getUsers(),
            adminService.getAllPlans(),
        ])
            .then(([u, p]) => { setUsers(u); setPlans(p); })
            .catch(() => setError('Greska pri ucitavanju podataka.'))
            .finally(() => setLoading(false));
    }, []);

    const changeTab = (t) => {
        setTab(t);
        setSearch('');
        if (t === 'users') setUserFilter(null);
    };

    const changeRole = async (id, role) => {
        if (id === user?.id) { alert('Ne mozete promeniti svoju ulogu.'); return; }
        setSavingId(id);
        try {
            await adminService.updateRole(id, role);
            setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
        } catch { alert('Greska pri promeni uloge.'); }
        finally { setSavingId(null); }
    };

    const deleteUser = async (id, name) => {
        if (id === user?.id) { alert('Ne mozete obrisati svoj nalog.'); return; }
        if (!window.confirm(`Obrisati korisnika "${name}"?`)) return;
        setDeletingId(id);
        try {
            await adminService.deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch { alert('Greska pri brisanju korisnika.'); }
        finally { setDeletingId(null); }
    };

    const deletePlan = async (id, name) => {
        if (!window.confirm(`Obrisati plan "${name}"?`)) return;
        setDeletingPlanId(id);
        try {
            await adminService.deletePlan(id);
            setPlans(prev => prev.filter(p => p.id !== id));
        } catch { alert('Greska pri brisanju plana.'); }
        finally { setDeletingPlanId(null); }
    };

    const viewUserPlans = (userId) => {
        setUserFilter(userId);
        setSearch('');
        setTab('plans');
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredPlans = plans
        .filter(p => !userFilter || p.userId === userFilter)
        .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

    const filterUserName = userFilter ? users.find(u => u.id === userFilter)?.name : null;

    return (
        <div style={s.container}>
            <div style={s.header}>
                <div style={s.headerLeft}>
                    <button style={s.backBtn} onClick={() => navigate('/')}>Nazad</button>
                    <div>
                        <h1 style={s.title}>Admin Panel</h1>
                        <p style={s.subtitle}>Upravljanje sistemom</p>
                    </div>
                </div>
                <div style={s.statsRow}>
                    <div style={s.statBadge}>
                        <span style={s.statNum}>{users.length}</span>
                        <span style={s.statLbl}>Korisnika</span>
                    </div>
                    <div style={s.statBadge}>
                        <span style={{ ...s.statNum, color: 'var(--green-light)' }}>{plans.length}</span>
                        <span style={s.statLbl}>Planova</span>
                    </div>
                    <div style={s.statBadge}>
                        <span style={{ ...s.statNum, color: 'var(--amber)' }}>{users.filter(u => u.role === 'Admin').length}</span>
                        <span style={s.statLbl}>Admina</span>
                    </div>
                </div>
            </div>

            <div style={s.tabBar}>
                <button style={{ ...s.tabBtn, ...(tab === 'users' ? s.tabActive : {}) }} onClick={() => changeTab('users')}>
                    Korisnici ({users.length})
                </button>
                <button style={{ ...s.tabBtn, ...(tab === 'plans' ? s.tabActive : {}) }} onClick={() => changeTab('plans')}>
                    Svi planovi ({plans.length})
                </button>
            </div>

            <div style={s.content}>
                {error && <div style={s.errorBox}>{error}</div>}

                {tab === 'plans' && userFilter && (
                    <div style={s.filterBanner}>
                        Prikazani planovi korisnika: <strong>{filterUserName}</strong>
                        <button style={s.clearFilter} onClick={() => setUserFilter(null)}>
                            Prikazi sve planove
                        </button>
                    </div>
                )}

                <div style={s.searchBar}>
                    <input style={s.searchInput} value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={tab === 'users' ? 'Pretrazi po imenu ili emailu...' : 'Pretrazi po nazivu plana...'} />
                </div>

                {loading ? <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text)' }}>Ucitavanje...</p> : (
                    <>
                        {tab === 'users' && (
                            <div style={s.tableWrap}>
                                <table style={s.table}>
                                    <thead>
                                        <tr style={s.thead}>
                                            <th style={s.th}>#</th>
                                            <th style={s.th}>Korisnik</th>
                                            <th style={s.th}>Email</th>
                                            <th style={s.th}>Registrovan</th>
                                            <th style={s.th}>Uloga</th>
                                            <th style={s.th}>Akcije</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((u, i) => (
                                            <tr key={u.id} style={{ ...s.tr, ...(i % 2 === 0 ? s.trEven : {}) }}>
                                                <td style={{ ...s.td, color: 'var(--text)', fontSize: '13px' }}>{u.id}</td>
                                                <td style={s.td}>
                                                    <div style={s.avatar}>
                                                        <div style={s.avatarCircle}>{u.name?.charAt(0).toUpperCase() || '?'}</div>
                                                        <span style={s.userName}>{u.name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ ...s.td, color: 'var(--text)', fontSize: '14px' }}>{u.email}</td>
                                                <td style={{ ...s.td, color: 'var(--text)', fontSize: '13px' }}>
                                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('sr-RS') : '—'}
                                                </td>
                                                <td style={s.td}>
                                                    <select
                                                        style={{ ...s.roleSelect, color: u.role === 'Admin' ? '#e65100' : '#1565C0', borderColor: u.role === 'Admin' ? '#ffcc80' : '#bbdefb', backgroundColor: u.role === 'Admin' ? '#fff3e0' : '#e3f2fd' }}
                                                        value={u.role}
                                                        onChange={e => changeRole(u.id, e.target.value)}
                                                        disabled={savingId === u.id || u.id === user?.id}>
                                                        <option value='User'>User</option>
                                                        <option value='Admin'>Admin</option>
                                                    </select>
                                                </td>
                                                <td style={s.td}>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <button style={s.plansBtn} onClick={() => viewUserPlans(u.id)}>
                                                            Planovi ({plans.filter(p => p.userId === u.id).length})
                                                        </button>
                                                        {u.id !== user?.id ? (
                                                            <button style={s.deleteBtn} onClick={() => deleteUser(u.id, u.name)} disabled={deletingId === u.id}>
                                                                {deletingId === u.id ? '...' : 'Obrisi'}
                                                            </button>
                                                        ) : (
                                                            <span style={{ fontSize: '12px', color: 'var(--text)' }}>Vi</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredUsers.length === 0 && <div style={s.noResults}>Nema korisnika.</div>}
                            </div>
                        )}

                        {tab === 'plans' && (
                            <div style={s.tableWrap}>
                                <table style={s.table}>
                                    <thead>
                                        <tr style={s.thead}>
                                            <th style={s.th}>#</th>
                                            <th style={s.th}>Naziv plana</th>
                                            <th style={s.th}>Korisnik</th>
                                            <th style={s.th}>Pocetak</th>
                                            <th style={s.th}>Kraj</th>
                                            <th style={s.th}>Budzet</th>
                                            <th style={s.th}>Destinacije</th>
                                            <th style={s.th}>Aktivnosti</th>
                                            <th style={s.th}>Akcije</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPlans.map((p, i) => {
                                            const owner = users.find(u => u.id === p.userId);
                                            return (
                                                <tr key={p.id} style={{ ...s.tr, ...(i % 2 === 0 ? s.trEven : {}), cursor: 'pointer' }}
                                                    onClick={() => navigate(`/plans/${p.id}`)}>
                                                    <td style={{ ...s.td, color: 'var(--text)', fontSize: '13px' }}>{p.id}</td>
                                                    <td style={{ ...s.td, fontWeight: '600', color: 'var(--text-h)' }}>{p.name}</td>
                                                    <td style={{ ...s.td, color: 'var(--text)', fontSize: '13px' }}>
                                                        {owner ? owner.email : `ID: ${p.userId}`}
                                                    </td>
                                                    <td style={{ ...s.td, color: 'var(--text)', fontSize: '13px' }}>{new Date(p.startDate).toLocaleDateString('sr-RS')}</td>
                                                    <td style={{ ...s.td, color: 'var(--text)', fontSize: '13px' }}>{new Date(p.endDate).toLocaleDateString('sr-RS')}</td>
                                                    <td style={{ ...s.td, fontWeight: '600', color: 'var(--green-light)' }}>{p.budget?.toFixed(0)} €</td>
                                                    <td style={{ ...s.td, color: 'var(--green-mid)' }}>{p.destinations?.length || 0}</td>
                                                    <td style={{ ...s.td, color: 'var(--text-2)' }}>{p.activities?.length || 0}</td>
                                                    <td style={s.td}>
                                                        <button
                                                            style={s.deleteBtn}
                                                            onClick={(e) => { e.stopPropagation(); deletePlan(p.id, p.name); }}
                                                            disabled={deletingPlanId === p.id}
                                                        >
                                                            {deletingPlanId === p.id ? '...' : 'Obrisi'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {filteredPlans.length === 0 && <div style={s.noResults}>Nema planova.</div>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

const s = {
    container: { minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
    header: { background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
    headerLeft: { display: 'flex', gap: '16px', alignItems: 'center' },
    backBtn: { padding: '8px 16px', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--sans)' },
    title: { margin: 0, fontSize: '24px', fontFamily: 'var(--serif)', fontWeight: 600, color: 'var(--text-h)', letterSpacing: '-0.3px' },
    subtitle: { margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text)' },
    statsRow: { display: 'flex', gap: '24px' },
    statBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
    statNum: { fontSize: '22px', fontWeight: '700', color: 'var(--text-h)', fontFamily: 'var(--sans)' },
    statLbl: { fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    tabBar: { background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', display: 'flex', padding: '0 40px' },
    tabBtn: { padding: '14px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', borderBottom: '2px solid transparent', marginBottom: '-1px', fontFamily: 'var(--sans)' },
    tabActive: { color: 'var(--green-light)', borderBottomColor: 'var(--green-light)' },
    content: { padding: '32px 40px', flex: 1 },
    errorBox: { background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px' },
    filterBanner: { background: 'var(--amber-bg)', border: '1px solid rgba(232,168,56,0.3)', color: 'var(--amber)', padding: '10px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px' },
    clearFilter: { padding: '4px 12px', background: 'transparent', border: '1px solid var(--amber)', color: 'var(--amber)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)' },
    searchBar: { marginBottom: '16px' },
    searchInput: { width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-h)', fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box' },
    tableWrap: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { background: 'var(--bg-2)' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' },
    tr: { borderBottom: '1px solid var(--border)' },
    trEven: { background: 'rgba(255,255,255,0.02)' },
    td: { padding: '13px 16px', fontSize: '14px', verticalAlign: 'middle', color: 'var(--text-2)' },
    avatar: { display: 'flex', alignItems: 'center', gap: '10px' },
    avatarCircle: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 },
    userName: { fontWeight: '500', color: 'var(--text-h)' },
    roleSelect: { padding: '5px 10px', borderRadius: '99px', border: '1px solid', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--sans)', outline: 'none' },
    plansBtn: { padding: '6px 12px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)' },
    deleteBtn: { padding: '6px 14px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)' },
    noResults: { textAlign: 'center', padding: '40px', color: 'var(--text)' },
};
