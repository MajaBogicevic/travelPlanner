import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

export default function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        adminService.getUsers()
            .then(setUsers)
            .catch(() => setError('Greška pri učitavanju korisnika.'))
            .finally(() => setLoading(false));
    }, []);

    const changeRole = async (id, role) => {
        setSavingId(id);
        try { await adminService.updateRole(id, role); setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u)); }
        catch { alert('Greška pri promjeni uloge.'); }
        finally { setSavingId(null); }
    };

    const deleteUser = async (id, name) => {
        if (!window.confirm(`Obrisati korisnika "${name}"? Svi njegovi planovi će biti obrisani.`)) return;
        setDeletingId(id);
        try { await adminService.deleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)); }
        catch { alert('Greška pri brisanju korisnika.'); }
        finally { setDeletingId(null); }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button style={styles.backBtn} onClick={() => navigate('/')}>← Nazad</button>
                    <div><h1 style={styles.title}>Admin Panel</h1><p style={styles.subtitle}>Upravljanje korisnicima sistema</p></div>
                </div>
                <div style={styles.statsRow}>
                    <div style={styles.statBadge}><span style={styles.statNum}>{users.length}</span><span style={styles.statLbl}>Ukupno</span></div>
                    <div style={styles.statBadge}><span style={{ ...styles.statNum, color: '#FFB74D' }}>{users.filter(u => u.role === 'Admin').length}</span><span style={styles.statLbl}>Admini</span></div>
                    <div style={styles.statBadge}><span style={{ ...styles.statNum, color: '#69f0ae' }}>{users.filter(u => u.role === 'User').length}</span><span style={styles.statLbl}>Korisnici</span></div>
                </div>
            </div>

            <div style={styles.content}>
                {error && <div style={styles.errorBox}>{error}</div>}
                <div style={styles.searchBar}>
                    <input style={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder='🔍 Pretraži po imenu ili emailu...' />
                    {search && <span style={styles.searchCount}>{filtered.length} od {users.length} korisnika</span>}
                </div>

                {loading ? <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>Učitavanje...</p> : (
                    <div style={styles.tableWrap}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.thead}>
                                    <th style={styles.th}>#</th>
                                    <th style={styles.th}>Korisnik</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Registrovan</th>
                                    <th style={styles.th}>Uloga</th>
                                    <th style={styles.th}>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u, i) => (
                                    <tr key={u.id} style={{ ...styles.tr, ...(i % 2 === 0 ? styles.trEven : {}) }}>
                                        <td style={{ ...styles.td, color: '#aaa', fontSize: '13px' }}>{u.id}</td>
                                        <td style={styles.td}>
                                            <div style={styles.avatar}>
                                                <div style={styles.avatarCircle}>{u.name?.charAt(0).toUpperCase() || '?'}</div>
                                                <span style={styles.userName}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ ...styles.td, color: '#555', fontSize: '14px' }}>{u.email}</td>
                                        <td style={{ ...styles.td, color: '#888', fontSize: '13px' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('bs-BA') : '—'}</td>
                                        <td style={styles.td}>
                                            <select style={{ ...styles.roleSelect, color: u.role === 'Admin' ? '#e65100' : '#1565C0', borderColor: u.role === 'Admin' ? '#ffcc80' : '#bbdefb', backgroundColor: u.role === 'Admin' ? '#fff3e0' : '#e3f2fd' }}
                                                value={u.role} onChange={e => changeRole(u.id, e.target.value)} disabled={savingId === u.id}>
                                                <option value='User'>User</option>
                                                <option value='Admin'>Admin</option>
                                            </select>
                                            {savingId === u.id && <span style={styles.saving}> ...</span>}
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.deleteBtn} onClick={() => deleteUser(u.id, u.name)} disabled={deletingId === u.id}>
                                                {deletingId === u.id ? '...' : '🗑️ Obriši'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && <div style={styles.noResults}>Nema korisnika koji odgovaraju pretrazi.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
    header: { backgroundColor: '#1565C0', color: 'white', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
    headerLeft: { display: 'flex', gap: '16px', alignItems: 'center' },
    backBtn: { padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
    title: { margin: 0, fontSize: '22px' },
    subtitle: { margin: '4px 0 0 0', fontSize: '13px', opacity: 0.8 },
    statsRow: { display: 'flex', gap: '20px' },
    statBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    statNum: { fontSize: '22px', fontWeight: 'bold', color: 'white' },
    statLbl: { fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' },
    content: { padding: '24px 32px' },
    errorBox: { backgroundColor: '#ffebee', color: '#d32f2f', padding: '12px', borderRadius: '6px', marginBottom: '16px' },
    searchBar: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
    searchInput: { flex: 1, padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', backgroundColor: 'white' },
    searchCount: { fontSize: '13px', color: '#888' },
    tableWrap: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    thead: { backgroundColor: '#f5f5f5' },
    th: { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #eee' },
    tr: { borderBottom: '1px solid #f5f5f5' },
    trEven: { backgroundColor: '#fafafa' },
    td: { padding: '12px 16px', fontSize: '14px', verticalAlign: 'middle' },
    avatar: { display: 'flex', alignItems: 'center', gap: '10px' },
    avatarCircle: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 },
    userName: { fontWeight: '500' },
    roleSelect: { padding: '5px 10px', borderRadius: '12px', border: '1px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
    saving: { color: '#888', fontSize: '12px' },
    deleteBtn: { padding: '6px 14px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    noResults: { textAlign: 'center', padding: '40px', color: '#888' },
};