import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';

const emptyForm = { name: '', location: '', arrivalDate: '', departureDate: '', description: '' };

export default function DestinationsTab({ planId, onRefresh }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [apiError, setApiError] = useState(null);

    const fetchDestinations = () => {
        travelPlanService.getDestinations(planId)
            .then(setDestinations)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchDestinations(); }, [planId]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Naziv je obavezan';
        if (!form.arrivalDate) errs.arrivalDate = 'Datum dolaska je obavezan';
        if (!form.departureDate) errs.departureDate = 'Datum odlaska je obavezan';
        if (form.arrivalDate && form.departureDate &&
            new Date(form.departureDate) < new Date(form.arrivalDate))
            errs.departureDate = 'Datum odlaska ne može biti prije dolaska';
        return errs;
    };

    const openAdd = () => {
        setForm(emptyForm); setErrors({}); setEditingId(null);
        setShowForm(true); setApiError(null);
    };

    const openEdit = (dest) => {
        setForm({
            name: dest.name,
            location: dest.location || '',
            arrivalDate: dest.arrivalDate?.split('T')[0] || '',
            departureDate: dest.departureDate?.split('T')[0] || '',
            description: dest.description || ''
        });
        setErrors({}); setEditingId(dest.id); setShowForm(true); setApiError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true); setApiError(null);
        try {
            if (editingId) {
                await travelPlanService.updateDestination(planId, editingId, form);
            } else {
                await travelPlanService.addDestination(planId, form);
            }
            setShowForm(false); fetchDestinations(); onRefresh();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Greška pri snimanju');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Obrisati destinaciju?')) return;
        try {
            await travelPlanService.deleteDestination(planId, id);
            fetchDestinations(); onRefresh();
        } catch { alert('Greška pri brisanju'); }
    };

    if (loading) return <p>Učitavanje...</p>;

    return (
        <div>
            <div style={styles.topBar}>
                <h3 style={styles.sectionTitle}>Destinacije ({destinations.length})</h3>
                <button style={styles.addBtn} onClick={openAdd}>+ Dodaj destinaciju</button>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <h4 style={styles.formTitle}>{editingId ? 'Uredi destinaciju' : 'Nova destinacija'}</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>Naziv *</label>
                                <input style={styles.input} name='name' value={form.name}
                                    onChange={handleChange} placeholder='npr. Atina' />
                                {errors.name && <span style={styles.error}>{errors.name}</span>}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Lokacija</label>
                                <input style={styles.input} name='location' value={form.location}
                                    onChange={handleChange} placeholder='npr. Grčka' />
                            </div>
                        </div>
                        <div style={styles.formRow}>
                            <div style={styles.field}>
                                <label style={styles.label}>Datum dolaska *</label>
                                <input style={styles.input} type='date' name='arrivalDate'
                                    value={form.arrivalDate} onChange={handleChange} />
                                {errors.arrivalDate && <span style={styles.error}>{errors.arrivalDate}</span>}
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>Datum odlaska *</label>
                                <input style={styles.input} type='date' name='departureDate'
                                    value={form.departureDate} onChange={handleChange} />
                                {errors.departureDate && <span style={styles.error}>{errors.departureDate}</span>}
                            </div>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Opis</label>
                            <textarea style={styles.textarea} name='description' value={form.description}
                                onChange={handleChange} placeholder='Kratki opis destinacije' />
                        </div>
                        {apiError && <div style={styles.apiError}>{apiError}</div>}
                        <div style={styles.formBtns}>
                            <button type='button' style={styles.cancelBtn} onClick={() => setShowForm(false)}>Otkaži</button>
                            <button type='submit' style={styles.saveBtn} disabled={saving}>
                                {saving ? 'Snima...' : 'Sačuvaj'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {destinations.length === 0 && !showForm && (
                <div style={styles.empty}><p>Nema destinacija. Dodajte prvu destinaciju.</p></div>
            )}

            <div style={styles.list}>
                {destinations.map((dest, i) => (
                    <div key={dest.id} style={styles.card}>
                        <div style={styles.cardLeft}>
                            <div style={styles.numBadge}>{i + 1}</div>
                            <div>
                                <div style={styles.destName}>{dest.name}</div>
                                {dest.location && <div style={styles.destLocation}>📍 {dest.location}</div>}
                                <div style={styles.destDates}>
                                    {new Date(dest.arrivalDate).toLocaleDateString('bs-BA')} —{' '}
                                    {new Date(dest.departureDate).toLocaleDateString('bs-BA')}
                                    <span style={styles.nights}>
                                        ({Math.ceil((new Date(dest.departureDate) - new Date(dest.arrivalDate)) / (1000 * 60 * 60 * 24))} noći)
                                    </span>
                                </div>
                                {dest.description && <p style={styles.destDesc}>{dest.description}</p>}
                            </div>
                        </div>
                        <div style={styles.cardActions}>
                            <button style={styles.editBtn} onClick={() => openEdit(dest)}>✏️ Uredi</button>
                            <button style={styles.deleteBtn} onClick={() => handleDelete(dest.id)}>🗑️</button>
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
    formCard: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    formTitle: { margin: '0 0 16px 0', color: '#1565C0' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '13px', color: '#555', fontWeight: '500' },
    input: { padding: '9px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
    textarea: { padding: '9px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minHeight: '70px', resize: 'vertical' },
    error: { color: '#d32f2f', fontSize: '12px' },
    apiError: { backgroundColor: '#ffebee', color: '#d32f2f', padding: '10px', borderRadius: '4px', marginBottom: '12px', fontSize: '13px' },
    formBtns: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: { padding: '8px 20px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    saveBtn: { padding: '8px 20px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    empty: { textAlign: 'center', padding: '40px', color: '#888', backgroundColor: 'white', borderRadius: '8px' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    card: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardLeft: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    numBadge: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 },
    destName: { fontSize: '16px', fontWeight: '600', marginBottom: '4px' },
    destLocation: { fontSize: '13px', color: '#666', marginBottom: '4px' },
    destDates: { fontSize: '13px', color: '#555' },
    nights: { marginLeft: '6px', color: '#888', fontStyle: 'italic' },
    destDesc: { fontSize: '13px', color: '#777', marginTop: '6px', margin: '6px 0 0 0' },
    cardActions: { display: 'flex', gap: '8px', flexShrink: 0 },
    editBtn: { padding: '6px 14px', backgroundColor: '#e3f2fd', color: '#1565C0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    deleteBtn: { padding: '6px 10px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
};