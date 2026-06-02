import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';

export default function CreatePlanPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', description: '', startDate: '',
        endDate: '', budget: '', notes: ''
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Naziv je obavezan';
        if (!form.startDate) errs.startDate = 'Datum polaska je obavezan';
        if (!form.endDate) errs.endDate = 'Datum povratka je obavezan';
        if (form.startDate && form.endDate &&
            new Date(form.endDate) < new Date(form.startDate))
            errs.endDate = 'Krajnji datum ne može biti prije početnog';
        if (form.budget !== '' && Number(form.budget) < 0)
            errs.budget = 'Budžet ne može biti negativan';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        setApiError(null);
        try {
            const plan = await travelPlanService.create({
                ...form,
                budget: Number(form.budget) || 0
            });
            navigate(`/plans/${plan.id}`);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Greška pri kreiranju plana');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Novo putovanje</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label>Naziv putovanja *</label>
                        <input style={styles.input} name='name' value={form.name}
                            onChange={handleChange} placeholder='npr. Odmor u Grčkoj' />
                        {errors.name && <span style={styles.error}>{errors.name}</span>}
                    </div>
                    <div style={styles.field}>
                        <label>Opis</label>
                        <textarea style={styles.textarea} name='description' value={form.description}
                            onChange={handleChange} placeholder='Kratki opis putovanja' />
                    </div>
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label>Datum polaska *</label>
                            <input style={styles.input} name='startDate' type='date'
                                value={form.startDate} onChange={handleChange} />
                            {errors.startDate && <span style={styles.error}>{errors.startDate}</span>}
                        </div>
                        <div style={styles.field}>
                            <label>Datum povratka *</label>
                            <input style={styles.input} name='endDate' type='date'
                                value={form.endDate} onChange={handleChange} />
                            {errors.endDate && <span style={styles.error}>{errors.endDate}</span>}
                        </div>
                    </div>
                    <div style={styles.field}>
                        <label>Budžet (€)</label>
                        <input style={styles.input} name='budget' type='number' min='0'
                            value={form.budget} onChange={handleChange} placeholder='0' />
                        {errors.budget && <span style={styles.error}>{errors.budget}</span>}
                    </div>
                    <div style={styles.field}>
                        <label>Napomene</label>
                        <textarea style={styles.textarea} name='notes' value={form.notes}
                            onChange={handleChange} placeholder='Dodatne napomene' />
                    </div>
                    {apiError && <div style={styles.apiError}>{apiError}</div>}
                    <div style={styles.buttons}>
                        <button style={styles.cancelBtn} type='button'
                            onClick={() => navigate('/')}>
                            Otkaži
                        </button>
                        <button style={styles.submitBtn} type='submit' disabled={submitting}>
                            {submitting ? 'Snima se...' : 'Kreiraj plan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh', backgroundColor: '#f5f5f5',
        display: 'flex', justifyContent: 'center', padding: '32px 16px'
    },
    card: {
        backgroundColor: 'white', padding: '40px',
        borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%', maxWidth: '600px', height: 'fit-content'
    },
    title: { color: '#1565C0', marginBottom: '24px' },
    field: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
    textarea: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minHeight: '80px' },
    error: { color: '#d32f2f', fontSize: '12px' },
    apiError: { backgroundColor: '#ffebee', color: '#d32f2f', padding: '10px', borderRadius: '4px', marginBottom: '16px' },
    buttons: { display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' },
    cancelBtn: { padding: '10px 24px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
    submitBtn: { padding: '10px 24px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};