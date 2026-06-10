import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';
import deleteIcon from '../../assets/delete.png';

export default function ChecklistTab({ planId }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newText, setNewText] = useState('');
    const [adding, setAdding] = useState(false);
    const [addError, setAddError] = useState(null);

    const fetchItems = () => {
        travelPlanService.getChecklist(planId)
            .then(setItems)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchItems(); }, [planId]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;
        setAdding(true); setAddError(null);
        try {
            await travelPlanService.addChecklistItem(planId, { text: newText.trim() });
            setNewText(''); fetchItems();
        } catch (err) {
            setAddError(err.response?.data?.message || 'Greška pri dodavanju');
        } finally { setAdding(false); }
    };

    const handleToggle = async (id) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i));
        try { await travelPlanService.toggleChecklist(planId, id); }
        catch { setItems(prev => prev.map(i => i.id === id ? { ...i, isCompleted: !i.isCompleted } : i)); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati stavku?')) return;
        try { await travelPlanService.deleteChecklistItem(planId, id); setItems(prev => prev.filter(i => i.id !== id)); }
        catch { alert('Greška pri brisanju'); }
    };

    const completed = items.filter(i => i.isCompleted).length;
    const total = items.length;
    const pct = total > 0 ? (completed / total) * 100 : 0;

    if (loading) return <p>Učitavanje...</p>;

    return (
        <div>
            <div style={styles.topBar}>
                <h3 style={styles.sectionTitle}>Lista</h3>
                {total > 0 && <span style={styles.progress}>{completed}/{total} završeno</span>}
            </div>

            {total > 0 && (
                <div style={styles.progressCard}>
                    <div style={styles.progressTrack}>
                        <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: pct === 100 ? '#388e3c' : '#1565C0' }} />
                    </div>
                    {pct === 100 && <div style={styles.allDone}>Sve je spremno za putovanje!</div>}
                </div>
            )}

            <form onSubmit={handleAdd} style={styles.addForm}>
                <input style={styles.addInput} value={newText} onChange={e => setNewText(e.target.value)}
                    placeholder='Dodaj stavku (npr. Pasoš, Putnička osiguranje...)' />
                <button type='submit' style={styles.addBtn} disabled={adding || !newText.trim()}>
                    {adding ? '...' : '+ Dodaj'}
                </button>
            </form>
            {addError && <div style={styles.addError}>{addError}</div>}

            {items.length === 0 && (
                <div style={styles.empty}><p>Lista je prazna. Dodajte stavke koje trebate pripremiti za putovanje.</p></div>
            )}

            {items.filter(i => !i.isCompleted).length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionLabel}>Na čekanju ({items.filter(i => !i.isCompleted).length})</div>
                    <div style={styles.list}>
                        {items.filter(i => !i.isCompleted).map(item => (
                            <div key={item.id} style={styles.item}>
                                <label style={styles.itemLabel}>
                                    <input type='checkbox' checked={false} onChange={() => handleToggle(item.id)} style={styles.checkbox} />
                                    <span style={styles.itemText}>{item.text}</span>
                                </label>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                                    <img src={deleteIcon} alt="Izbrisi" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {items.filter(i => i.isCompleted).length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionLabel}>Završeno ({completed})</div>
                    <div style={styles.list}>
                        {items.filter(i => i.isCompleted).map(item => (
                            <div key={item.id} style={{ ...styles.item, ...styles.completedItem }}>
                                <label style={styles.itemLabel}>
                                    <input type='checkbox' checked={true} onChange={() => handleToggle(item.id)} style={styles.checkbox} />
                                    <span style={{ ...styles.itemText, ...styles.completedText }}>{item.text}</span>
                                </label>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                                    <img src={deleteIcon} alt="Izbrisi" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    sectionTitle: { margin: 0, color: 'var(--text-h)', fontSize: '18px', fontFamily: 'var(--serif)' },
    progress: { fontSize: '14px', color: 'var(--green-light)', fontWeight: '600' },
    progressCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px' },
    progressTrack: { height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '99px', transition: 'width 0.4s ease' },
    allDone: { marginTop: '10px', textAlign: 'center', fontSize: '14px', color: 'var(--green-light)', fontWeight: '600' },
    addForm: { display: 'flex', gap: '10px', marginBottom: '6px' },
    addInput: { flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-h)', fontFamily: 'var(--sans)', outline: 'none' },
    addBtn: { padding: '10px 20px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--sans)', fontSize: '13px' },
    addError: { color: 'var(--red)', fontSize: '12px', marginBottom: '12px' },
    empty: { textAlign: 'center', padding: '40px', color: 'var(--text)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', marginTop: '12px' },
    section: { marginTop: '16px' },
    sectionLabel: { fontSize: '11px', fontWeight: '600', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' },
    list: { display: 'flex', flexDirection: 'column', gap: '6px' },
    item: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    completedItem: { opacity: 0.6 },
    itemLabel: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 },
    checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--green-mid)', flexShrink: 0 },
    itemText: { fontSize: '14px', color: 'var(--text-h)' },
    completedText: { textDecoration: 'line-through', color: 'var(--text)' },
    deleteBtn: { padding: '4px 8px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.5, color: 'var(--red)' },
};