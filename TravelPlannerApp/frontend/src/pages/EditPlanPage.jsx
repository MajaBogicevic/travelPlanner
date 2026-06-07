import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';

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

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><p style={{ color: '#666' }}>Učitavanje...</p></div>;

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
                        <button type='button' style={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>🗑️ Obriši plan</button>
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
                        <h3 style={{ margin: '0 0 12px 0', color: '#d32f2f' }}>⚠️ Obriši plan?</h3>
                        <p style={{ color: '#555', marginBottom: '20px' }}>Ovo će trajno obrisati plan zajedno sa svim destinacijama, aktivnostima, troškovima i checklistom. Radnja se ne može poništiti.</p>
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
    container: { minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', padding: '32px 16px' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '600px', height: 'fit-content' },
    title: { color: '#1565C0', marginBottom: '24px' },
    field: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
    textarea: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
    error: { color: '#d32f2f', fontSize: '12px' },
    apiError: { backgroundColor: '#ffebee', color: '#d32f2f', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
    buttons: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' },
    cancelBtn: { padding: '10px 24px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    submitBtn: { padding: '10px 24px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    deleteBtn: { padding: '10px 20px', backgroundColor: 'white', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer' },
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' },
    dialog: { backgroundColor: 'white', borderRadius: '8px', padding: '32px', maxWidth: '440px', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
};