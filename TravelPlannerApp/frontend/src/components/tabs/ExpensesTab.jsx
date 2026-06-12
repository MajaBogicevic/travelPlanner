import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';
import editIcon from '../../assets/edit.png';
import deleteIcon from '../../assets/delete.png';

const CATEGORIES = ['Transport', 'Accommodation', 'Food', 'Tickets', 'Shopping', 'Other'];
const CATEGORY_ICONS = { Transport: '', Accommodation: '', Food: '', Tickets: '', Shopping: '', Other: '' };
const CATEGORY_LABELS = { Transport: 'Transport', Accommodation: 'Smeštaj', Food: 'Hrana', Tickets: 'Ulaznice', Shopping: 'Kupovina', Other: 'Ostalo' };

const emptyForm = { name: '', category: 'Transport', amount: '', date: '', description: '' };

export default function ExpensesTab({ planId, budget, onRefresh, plan }) {
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
        if (plan && form.date && new Date(form.date) < new Date(plan.startDate))
            errs.date = 'Datum ne moze biti pre pocetka plana';
        if (plan && form.date && new Date(form.date) > new Date(plan.endDate))
            errs.date = 'Datum ne moze biti nakon zavrsetka plana';
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
                {over && <div style={styles.overWarning}>Prekoračili ste budžet za {Math.abs(remaining).toFixed(2)} €</div>}
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
                            <div style={styles.catIcon}>{CATEGORY_ICONS[exp.category] || ''}</div>
                            <div>
                                <div style={styles.expName}>{exp.name}</div>
                                <div style={styles.expMeta}>{CATEGORY_LABELS[exp.category] || exp.category} • {new Date(exp.date).toLocaleDateString('bs-BA')}{exp.description && ` • ${exp.description}`}</div>
                            </div>
                        </div>
                        <div style={styles.cardRight}>
                            <span style={styles.amount}>{exp.amount?.toFixed(2)} €</span>
                            <div style={styles.cardActions}>
                                <button style={styles.editBtn} onClick={() => openEdit(exp)}>
                                     <img src={editIcon} alt="Izmeni" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                </button>
                                <button style={styles.deleteBtn} onClick={() => handleDelete(exp.id)}>
                                      <img src={deleteIcon} alt="Izbrisi" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                </button>
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
    sectionTitle: { margin: 0, color: 'var(--text-h)', fontSize: '18px', fontFamily: 'var(--serif)' },
    addBtn: { padding: '8px 18px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--sans)' },
    budgetCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '16px' },
    budgetRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
    budgetItem: { display: 'flex', flexDirection: 'column', gap: '2px' },
    budgetLabel: { fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    budgetVal: { fontSize: '20px', fontWeight: 'bold', color: 'var(--text-h)', fontFamily: 'var(--sans)' },
    progressTrack: { height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '99px', transition: 'width 0.4s ease' },
    pctLabel: { fontSize: '12px', color: 'var(--text)', marginTop: '6px' },
    overWarning: { marginTop: '10px', padding: '10px 14px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', fontSize: '13px' },
    catBreakdown: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' },
    catItem: { display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', minWidth: '160px', color: 'var(--text-2)' },
    formCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '16px' },
    formTitle: { margin: '0 0 16px 0', color: 'var(--green-light)', fontSize: '14px', fontWeight: '600', fontFamily: 'var(--sans)' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '12px', color: 'var(--text-2)', fontWeight: '500', letterSpacing: '0.2px' },
    input: { padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)', color: 'var(--text-h)', fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box', width: '100%' },
    error: { color: 'var(--red)', fontSize: '12px' },
    apiError: { background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '13px' },
    formBtns: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: { padding: '8px 18px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '13px' },
    saveBtn: { padding: '8px 18px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '13px' },
    filterRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
    filterBtn: { padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '99px', cursor: 'pointer', fontSize: '12px', color: 'var(--text)', fontFamily: 'var(--sans)' },
    filterActive: { background: 'var(--green-dark)', color: 'var(--green-pale)', borderColor: 'var(--green)' },
    empty: { textAlign: 'center', padding: '40px', color: 'var(--text)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' },
    list: { display: 'flex', flexDirection: 'column', gap: '10px' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardLeft: { display: 'flex', gap: '14px', alignItems: 'center' },
    cardRight: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
    catIcon: { fontSize: '22px', width: '36px', textAlign: 'center' },
    expName: { fontSize: '14px', fontWeight: '600', color: 'var(--text-h)' },
    expMeta: { fontSize: '12px', color: 'var(--text)', marginTop: '2px' },
    amount: { fontSize: '17px', fontWeight: 'bold', color: 'var(--text-h)', fontFamily: 'var(--sans)' },
    cardActions: { display: 'flex', gap: '6px' },
    editBtn: { padding: '5px 12px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)' },
    deleteBtn: { padding: '5px 10px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)' },
};