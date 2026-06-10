import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import travelPlanService from '../services/travelPlanService';
import logoIcon from '../assets/logoTravelApp.png';
import logoFont from '../assets/TravelAppFont.png';

export default function CreatePlanPage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [form, setForm] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setErrors(prev => ({ ...prev, [e.target.name]: null }));
        setApiError(null);
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Naziv je obavezan';
        if (!form.startDate) errs.startDate = 'Datum polaska je obavezan';
        if (!form.endDate) errs.endDate = 'Datum povratka je obavezan';
        if (form.startDate && form.endDate && form.endDate < form.startDate)
            errs.endDate = 'Datum povratka ne moze biti pre datuma polaska';
        if (form.budget && Number(form.budget) < 0)
            errs.budget = 'Budzet ne moze biti negativan';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        try {
            const plan = await travelPlanService.create({
                ...form,
                budget: form.budget ? Number(form.budget) : 0,
            });
            navigate(`/plans/${plan.id}`);
        } catch (err) {
            setApiError(err.response?.data?.message || 'Greska pri kreiranju plana');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <div style={s.root}>

            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <img src={logoIcon} alt="logo" style={s.navIcon} />
                    <img src={logoFont} alt="TravelApp" style={s.navFont} />
                </div>
                <div style={s.navRight}>
                    <span style={s.navEmail}>{user?.email}</span>
                    <button style={s.ghostBtn} onClick={() => navigate('/')}>
                        ← Nazad
                    </button>
                    <button style={s.logoutBtn} onClick={handleLogout}>
                        Odjavi se
                    </button>
                </div>
            </nav>

            <div style={s.content}>
                <div style={s.pageHeader}>
                    <h1 style={s.pageTitle}>Novo putovanje</h1>
                    <p style={s.pageSubtitle}>Unesite osnovne informacije o putovanju</p>
                </div>

                <div style={s.formCard}>
                    <form onSubmit={handleSubmit} style={s.form}>

                        <div style={s.field}>
                            <label style={s.label}>Naziv putovanja *</label>
                            <input
                                style={s.input}
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="npr. Letovanje u Grckoj"
                            />
                            {errors.name && <span style={s.fieldError}>{errors.name}</span>}
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Opis</label>
                            <textarea
                                style={{ ...s.input, ...s.textarea }}
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Kratki opis putovanja..."
                            />
                        </div>

                        <div style={s.row}>
                            <div style={{ ...s.field, flex: 1 }}>
                                <label style={s.label}>Datum polaska *</label>
                                <input
                                    style={s.input}
                                    name="startDate"
                                    type="date"
                                    value={form.startDate}
                                    onChange={handleChange}
                                />
                                {errors.startDate && <span style={s.fieldError}>{errors.startDate}</span>}
                            </div>
                            <div style={{ ...s.field, flex: 1 }}>
                                <label style={s.label}>Datum povratka *</label>
                                <input
                                    style={s.input}
                                    name="endDate"
                                    type="date"
                                    value={form.endDate}
                                    onChange={handleChange}
                                />
                                {errors.endDate && <span style={s.fieldError}>{errors.endDate}</span>}
                            </div>
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Planirani budzet (€)</label>
                            <input
                                style={s.input}
                                name="budget"
                                type="number"
                                min="0"
                                value={form.budget}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            {errors.budget && <span style={s.fieldError}>{errors.budget}</span>}
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Napomene</label>
                            <textarea
                                style={{ ...s.input, ...s.textarea }}
                                name="notes"
                                value={form.notes}
                                onChange={handleChange}
                                placeholder="Dodatne napomene..."
                            />
                        </div>

                        {apiError && (
                            <div style={s.errorBox}>
                                <span>⚠</span> {apiError}
                            </div>
                        )}

                        <div style={s.actions}>
                            <button
                                type="button"
                                style={s.cancelBtn}
                                onClick={() => navigate('/')}
                            >
                                Otkazati
                            </button>
                            <button
                                type="submit"
                                style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                                disabled={submitting}
                            >
                                {submitting ? 'Kreiranje...' : 'Kreiraj putovanje →'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

const s = {
    root: {
        minHeight: '100svh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
    },

    navbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '100px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
    },
    navLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    navIcon: {
        width: '80px',
        height: '80px',
        objectFit: 'contain',
    },
    navFont: {
        height: '80px',
        marginTop: '10px',
        objectFit: 'contain',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    navEmail: {
        fontSize: '13px',
        color: 'var(--text)',
    },
    ghostBtn: {
        padding: '7px 14px',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
        transition: 'border-color 0.2s, color 0.2s',
    },
    logoutBtn: {
        padding: '7px 14px',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
    },

    content: {
        maxWidth: '760px',
        width: '100%',
        margin: '0 auto',
        padding: '48px 40px',
    },
    pageHeader: {
        marginBottom: '32px',
    },
    pageTitle: {
        fontFamily: 'var(--serif)',
        fontSize: '36px',
        fontWeight: 600,
        color: 'var(--text-h)',
        letterSpacing: '-0.5px',
        marginBottom: '8px',
    },
    pageSubtitle: {
        fontSize: '14px',
        color: 'var(--text)',
    },

    formCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
    },
    row: {
        display: 'flex',
        gap: '20px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
    },
    label: {
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-2)',
        letterSpacing: '0.2px',
    },
    input: {
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-h)',
        padding: '12px 16px',
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'var(--sans)',
    },
    textarea: {
        resize: 'vertical',
        minHeight: '90px',
    },
    fieldError: {
        fontSize: '12px',
        color: 'var(--red)',
    },
    errorBox: {
        background: 'var(--red-bg)',
        border: '1px solid rgba(224,92,92,0.3)',
        color: 'var(--red)',
        borderRadius: 'var(--radius-sm)',
        padding: '11px 14px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '8px',
    },
    cancelBtn: {
        padding: '11px 22px',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
    },
    submitBtn: {
        padding: '11px 24px',
        background: 'var(--green-dark)',
        border: '1px solid var(--green)',
        color: 'var(--green-pale)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
        transition: 'background 0.2s',
    },
};