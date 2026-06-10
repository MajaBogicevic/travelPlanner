import { useState, useEffect } from 'react';
import travelPlanService from '../../services/travelPlanService';
import editIcon from '../../assets/edit.png';
import deleteIcon from '../../assets/delete.png';
import locationIcon from '../../assets/location.webp';

const emptyForm = { name: '', location: '', arrivalDate: '', departureDate: '', description: '' };

export default function DestinationsTab({ planId, onRefresh, plan }) {
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
            errs.departureDate = 'Datum odlaska ne može biti pre dolaska';
        if (plan && form.arrivalDate && new Date(form.arrivalDate) < new Date(plan.startDate))
            errs.arrivalDate = 'Datum dolaska ne može biti pre početka plana';
        if (plan && form.arrivalDate && new Date(form.arrivalDate) > new Date(plan.endDate)) 
            errs.arrivalDate = 'Datum dolaska ne može biti nakon završetka plana';
        if (plan && form.departureDate && new Date(form.departureDate) > new Date(plan.endDate))
            errs.departureDate = 'Datum odlaska ne može biti nakon završetka plana';
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
                                {dest.location && <div style={styles.destLocation}>
                                    <img src={locationIcon} alt="Lokacija" style={{ width: '12px', height: '12px', objectFit: 'contain', marginRight: '5px' }} />
                                    {dest.location}
                                </div>}
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
                            <button style={styles.editBtn} onClick={() => openEdit(dest)}>
                                <img src={editIcon} alt="Izmeni" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                            </button>
                            <button style={styles.deleteBtn} onClick={() => handleDelete(dest.id)}>
                                <img src={deleteIcon} alt="Izbrisi" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                            </button>
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
    formCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '20px' },
    formTitle: { margin: '0 0 16px 0', color: 'var(--green-light)', fontSize: '14px', fontWeight: '600', fontFamily: 'var(--sans)' },
    formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    field: { marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' },
    label: { fontSize: '12px', color: 'var(--text-2)', fontWeight: '500', letterSpacing: '0.2px' },
    input: { padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)', color: 'var(--text-h)', fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box' },
    textarea: { padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)', color: 'var(--text-h)', fontFamily: 'var(--sans)', outline: 'none', minHeight: '70px', resize: 'vertical', boxSizing: 'border-box' },
    error: { color: 'var(--red)', fontSize: '12px' },
    apiError: { background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '12px', fontSize: '13px' },
    formBtns: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' },
    cancelBtn: { padding: '8px 18px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '13px' },
    saveBtn: { padding: '8px 18px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '13px' },
    empty: { textAlign: 'center', padding: '40px', color: 'var(--text)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' },
    list: { display: 'flex', flexDirection: 'column', gap: '12px' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', transition: 'border-color 0.2s' },
    cardLeft: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
    numBadge: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, fontSize: '13px' },
    destName: { fontSize: '19px', fontWeight: '600', color: 'var(--text-h)', marginBottom: '4px' },
    destLocation: { fontSize: '13px', color: 'var(--text)', marginBottom: '4px' },
    destDates: { fontSize: '13px', color: 'var(--text-2)' },
    nights: { marginLeft: '6px', color: 'var(--text)', fontStyle: 'italic' },
    destDesc: { fontSize: '13px', color: 'var(--text)', marginTop: '6px', margin: '6px 0 0 0' },
    cardActions: { display: 'flex', gap: '8px', flexShrink: 0 },
    editBtn: { padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)' },
    deleteBtn: { padding: '6px 12px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--sans)' },
};