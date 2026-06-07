import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';

const CATEGORIES = ['Transport', 'Accommodation', 'Food', 'Tickets', 'Shopping', 'Other'];
const CATEGORY_ICONS = { Transport: '✈️', Accommodation: '🏨', Food: '🍽️', Tickets: '🎫', Shopping: '🛍️', Other: '💳' };
const CATEGORY_LABELS = { Transport: 'Transport', Accommodation: 'Smještaj', Food: 'Hrana', Tickets: 'Ulaznice', Shopping: 'Shopping', Other: 'Ostalo' };

const emptyForm = { name: '', category: 'Transport', amount: '', date: '', description: '' };

export default function ExpensesTab({ planId, budget, onRefresh }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [filterCat, setFilterCat] = useState('All');

    const fetchExpenses = () => {
        travelPlanService.getExpenses(planId)
            .then(setExpenses)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchExpenses(); }, [planId]);

    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const remaining = (budget || 0) - totalSpent;
    const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
    const over = remaining < 0;

    const byCat = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0);
        return acc;
    }, {});

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Naziv je obavezan';
        if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Iznos mora biti pozitivan';
        if (!form.date) errs.date = 'Datum je obavezan';
        return errs;
    };

    const openAdd = () => { setForm(emptyForm); setErrors({}); setEditingId(null); setShowForm(true); setApiError(null); };
    const openEdit = (exp) => {
        setForm({ name: exp.name, category: exp.category || 'Other', amount: exp.amount?.toString() || '', date: exp.date?.split('T')[0] || '', description: exp.description || '' });
        setErrors({}); setEditingId(exp.id); setShowForm(true); setApiError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true); setApiError(null);
        const payload = { ...form, amount: parseFloat(form.amount) };
        try {
            if (editingId) {
                await travelPlanService.updateExpense(planId, editingId, payload);
            } else {
                await travelPlanService.addExpense(planId, payload);
            }
            setShowForm(false); fetchExpenses(); onRefresh();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Greška pri snimanju');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati trošak?')) return;
        try { await travelPlanService.deleteExpense(planId, id); fetchExpenses(); onRefresh(); }
        catch { alert('Greška pri brisanju'); }
    };

    const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat);

    if (loading) return <p>Učitavanje...</p>;

    return (
        <div>
            <div style={styles.topBar}>
                <h3 style={styles.sectionTitle}>Troškovi ({expenses.length})</h3>
                <button style={styles.addBtn} onClick={openAdd}>+ Dodaj trošak</button>
            </div>

            <div style={styles.budgetCard}>
                <div style={styles.budgetRow}>
                    <div style={styles.budgetItem}><span style={styles.budgetLabel}>Budžet</span><span style={styles.budgetVal}>{(budget || 0).toFixed(2)} €</span></div>
                    <div style={styles.budgetItem}><span style={styles.budgetLabel}>Potrošeno</span><span style={{ ...styles.budgetVal, color: '#d32f2f' }}>{totalSpent.toFixed(2)} €</span></div>
                    <div style={styles.budgetItem}><span style={styles.budgetLabel}>Preostalo</span><span style={{ ...styles.budgetVal, color: over ? '#d32f2f' : '#388e3c' }}>{remaining.toFixed(2)} €</span></div>
                </div>
                <div style={styles.progressTrack}>
                    <div style={{ ...styles.progressFill, width: `${pct}%`, backgroundColor: over ? '#d32f2f' : pct > 75 ? '#FF9800' : '#388e3c' }} />
                </div>
                <div style={styles.pctLabel}>{pct.toFixed(0)}% iskorišteno</div>
                {over && <div style={styles.overWarning}>⚠️ Prekoračili ste budžet za {Math.abs(remaining).toFixed(2)} €</div>}
                <div style={styles.catBreakdown}>
                    {CATEGORIES.filter(c => byCat[c] > 0).map(c => (
                        <div key={c} style={styles.catItem}>
                            <span>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</span>
                            <span style={{ fontWeight: '600' }}>{byCat[c].toFixed(2)} €</span>
                        </div>
                    ))}
                </div>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <h4 style={styles.formTitle}>{editingId ? 'Uredi trošak' : 'Novi trošak'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>Naziv *</label>
                                <input style={styles.input} name='name' value={form.name} onChange={handleChange} placeholder='npr. Avionska karta' />
                                {errors.name && <span style={styles.error}>{errors.name}</span>}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Kategorija</label>
                                <select style={styles.input} name='category' value={form.category} onChange={handleChange}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={styles.formRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>Iznos (€) *</label>
                                <input style={styles.input} type='number' min='0.01' step='0.01' name='amount' value={form.amount} onChange={handleChange} />
                                {errors.amount && <span style={styles.error}>{errors.amount}</span>}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Datum *</label>
                                <input style={styles.input} type='date' name='date' value={form.date} onChange={handleChange} />
                                {errors.date && <span style={styles.error}>{errors.date}</span>}
                            </div>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Opis</label>
                            <input style={styles.input} name='description' value={form.description} onChange={handleChange} placeholder='Opcionalni opis' />
                        </div>
                        {apiError && <div style={styles.apiError}>{apiError}</div>}
                        <div style={styles.formBtns}>
                            <button type='button' style={styles.cancelBtn} onClick={() => setShowForm(false)}>Otkaži</button>
                            <button type='submit' style={styles.saveBtn} disabled={saving}>{saving ? 'Snima...' : 'Sačuvaj'}</button>
                        </div>
                    </form>
                </div>
            )}

            {expenses.length > 0 && (
                <div style={styles.filterRow}>
                    <button style={{ ...styles.filterBtn, ...(filterCat === 'All' ? styles.filterActive : {}) }} onClick={() => setFilterCat('All')}>Sve</button>
                    {CATEGORIES.filter(c => byCat[c] > 0).map(c => (
                        <button key={c} style={{ ...styles.filterBtn, ...(filterCat === c ? styles.filterActive : {}) }} onClick={() => setFilterCat(c)}>
                            {CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}
                        </button>
                    ))}
                </div>
            )}

            {filtered.length === 0 && !showForm && <div style={styles.empty}><p>Nema troškova. Dodajte prvi trošak.</p></div>}

            <div style={styles.list}>
                {filtered.map(exp => (
                    <div key={exp.id} style={styles.card}>
                        <div style={styles.cardLeft}>
                            <div style={styles.catIcon}>{CATEGORY_ICONS[exp.category] || '💳'}</div>
                            <div>
                                <div style={styles.expName}>{exp.name}</div>
                                <div style={styles.expMeta}>{CATEGORY_LABELS[exp.category] || exp.category} • {new Date(exp.date).toLocaleDateString('bs-BA')}{exp.description && ` • ${exp.description}`}</div>
                            </div>
                        </div>
                        <div style={styles.cardRight}>
                            <span style={styles.amount}>{exp.amount?.toFixed(2)} €</span>
                            <div style={styles.cardActions}>
                                <button style={styles.editBtn} onClick={() => openEdit(exp)}>✏️</button>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(exp.id)}>🗑️</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    sectionTitle: { margin: 0, color: '#333', fontSize: '18px' },
    addBtn: { padding: '8px 20px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    budgetCard: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    budgetRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    budgetItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
    budgetLabel: { fontSize: '12px', color: '#888', textTransform: 'uppercase' },
    budgetVal: { fontSize: '20px', fontWeight: 'bold', color: '#333' },
    progressTrack: { height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '5px', transition: 'width 0.4s ease' },
    pctLabel: { fontSize: '12px', color: '#888', marginTop: '4px' },
    overWarning: { marginTop: '10px', padding: '8px 12px', backgroundColor: '#ffebee', color: '#d32f2f', borderRadius: '4px', fontSize: '13px' },
    catBreakdown: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '12px' },
    catItem: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 12px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '13px', minWidth: '160px' },
    formCard: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    formTitle: { margin: '0 0 16px 0', color: '#1565C0' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '13px', color: '#555', fontWeight: '500' },
    input: { padding: '9px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
    error: { color: '#d32f2f', fontSize: '12px' },
    apiError: { backgroundColor: '#ffebee', color: '#d32f2f', padding: '10px', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' },
    formBtns: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: { padding: '8px 20px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    saveBtn: { padding: '8px 20px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
    filterBtn: { padding: '6px 14px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', color: '#555' },
    filterActive: { backgroundColor: '#1565C0', color: 'white', borderColor: '#1565C0' },
    empty: { textAlign: 'center', padding: '40px', color: '#888', backgroundColor: 'white', borderRadius: '8px' },
    list: { display: 'flex', flexDirection: 'column', gap: '10px' },
    card: { backgroundColor: 'white', borderRadius: '8px', padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardLeft: { display: 'flex', gap: '14px', alignItems: 'center' },
    cardRight: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
    catIcon: { fontSize: '24px', width: '40px', textAlign: 'center' },
    expName: { fontSize: '15px', fontWeight: '600' },
    expMeta: { fontSize: '13px', color: '#888', marginTop: '2px' },
    amount: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
    cardActions: { display: 'flex', gap: '6px' },
    editBtn: { padding: '5px 10px', backgroundColor: '#e3f2fd', color: '#1565C0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    deleteBtn: { padding: '5px 10px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
};