import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';
import deleteIcon from '../assets/delete.png';

export default function EditPlanPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '', budget: '', notes: '' });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        travelPlanService.getById(id)
            .then(plan => setForm({
                name: plan.name || '', description: plan.description || '',
                startDate: plan.startDate?.split('T')[0] || '',
                endDate: plan.endDate?.split('T')[0] || '',
                budget: plan.budget?.toString() || '', notes: plan.notes || ''
            }))
            .catch(() => setApiError('Plan nije pronađen.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Naziv je obavezan';
        if (!form.startDate) errs.startDate = 'Datum polaska je obavezan';
        if (!form.endDate) errs.endDate = 'Datum povratka je obavezan';
        if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate))
            errs.endDate = 'Krajnji datum ne može biti prije početnog';
        if (form.budget !== '' && Number(form.budget) < 0)
            errs.budget = 'Budžet ne može biti negativan';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true); setApiError(null);
        try {
            await travelPlanService.update(id, { ...form, budget: Number(form.budget) || 0 });
            navigate(`/plans/${id}`);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Greška pri ažuriranju plana');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try { await travelPlanService.delete(id); navigate('/'); }
        catch { setApiError('Greška pri brisanju plana.'); setShowDeleteConfirm(false); setSubmitting(false); }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100svh', background: 'var(--bg)' }}><p style={{ color: 'var(--text)' }}>Ucitavanje...</p></div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Uredi putovanje</h2>
                {apiError && <div style={styles.apiError}>{apiError}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label>Naziv putovanja *</label>
                        <input style={styles.input} name='name' value={form.name} onChange={handleChange} />
                        {errors.name && <span style={styles.error}>{errors.name}</span>}
                    </div>
                    <div style={styles.field}>
                        <label>Opis</label>
                        <textarea style={styles.textarea} name='description' value={form.description} onChange={handleChange} />
                    </div>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>Datum polaska *</label>
                            <input style={styles.input} name='startDate' type='date' value={form.startDate} onChange={handleChange} />
                            {errors.startDate && <span style={styles.error}>{errors.startDate}</span>}
                        </div>
                        <div style={styles.field}>
                            <label>Datum povratka *</label>
                            <input style={styles.input} name='endDate' type='date' value={form.endDate} onChange={handleChange} />
                            {errors.endDate && <span style={styles.error}>{errors.endDate}</span>}
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label>Budžet (€)</label>
                        <input style={styles.input} name='budget' type='number' min='0' value={form.budget} onChange={handleChange} />
                        {errors.budget && <span style={styles.error}>{errors.budget}</span>}
                    </div>
                    <div style={styles.field}>
                        <label>Napomene</label>
                        <textarea style={styles.textarea} name='notes' value={form.notes} onChange={handleChange} />
                    </div>
                    <div style={styles.buttons}>
                        <button type='button' style={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
                            <img src={deleteIcon} alt="Izbrisi" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                        </button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={styles.cancelBtn} type='button' onClick={() => navigate(`/plans/${id}`)}>Otkaži</button>
                            <button style={styles.submitBtn} type='submit' disabled={submitting}>{submitting ? 'Snima se...' : 'Sačuvaj promjene'}</button>
                        </div>
                    </div>
                </form>
            </div>

            {showDeleteConfirm && (
                <div style={styles.overlay}>
                    <div style={styles.dialog}>
                        <h3 style={{ margin: '0 0 12px 0', color: 'var(--red)', fontFamily: 'var(--serif)' }}>Obrisi plan?</h3>
                        <p style={{ color: 'var(--text)', marginBottom: '20px', fontSize: '14px', lineHeight: 1.6 }}>
                            Ovo ce trajno obrisati plan zajedno sa svim destinacijama, aktivnostima, troskovima i listom obaveza. Radnja se ne moze ponistiti.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button style={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Odustani</button>
                            <button style={{ ...styles.submitBtn, backgroundColor: '#d32f2f' }} onClick={handleDelete} disabled={submitting}>{submitting ? 'Briše se...' : 'Da, obriši'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { minHeight: '100svh', background: 'var(--bg)', display: 'flex', justifyContent: 'center', padding: '48px 16px' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '40px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '620px', height: 'fit-content' },
    title: { fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 500, color: 'var(--text-h)', marginBottom: '28px', letterSpacing: '-0.3px' },
    field: { marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '6px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    label: { fontSize: '13px', fontWeight: 500, color: 'var(--text-2)', letterSpacing: '0.2px' },
    input: { padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)', color: 'var(--text-h)', fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box' },
    textarea: { padding: '11px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '14px', background: 'var(--bg)', color: 'var(--text-h)', fontFamily: 'var(--sans)', outline: 'none', minHeight: '88px', resize: 'vertical', boxSizing: 'border-box' },
    error: { color: 'var(--red)', fontSize: '12px' },
    apiError: { background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', padding: '11px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '13px' },
    buttons: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' },
    cancelBtn: { padding: '10px 22px', background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '13px' },
    submitBtn: { padding: '10px 22px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 500 },
    deleteBtn: { padding: '10px 18px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '13px' },
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' },
    dialog: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '440px', width: '100%' },
};