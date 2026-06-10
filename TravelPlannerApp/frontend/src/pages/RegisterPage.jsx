import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import logoIcon from '../assets/logoTravelApp.png';

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
        if (!form.name.trim()) errs.name = 'Ime je obavezno';
        if (!form.email.trim()) errs.email = 'Email je obavezan';
        if (!form.password) errs.password = 'Lozinka je obavezna';
        if (form.password.length < 6) errs.password = 'Lozinka mora imati najmanje 6 karaktera';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Lozinke se ne poklapaju';
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSubmitting(true);
        setApiError(null);
        try {
            await authService.register({ name: form.name, email: form.email, password: form.password });
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Greška pri registraciji');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={s.root}>

            <div style={s.formSide}>
                <div style={s.formBox}>

                    <div style={s.logoWrap}>
                        <img src={logoIcon} alt="Travel App" style={s.logoIcon} />
                    </div>

                    <div style={s.formHeader}>
                        <h2 style={s.formTitle}>Kreirajte nalog</h2>
                        <p style={s.formSub}>Registrujte se i počnite sa planiranjem</p>
                    </div>

                    <form onSubmit={handleSubmit} autoComplete="off" style={s.form}>
                        <div style={s.field}>
                            <label style={s.label}>Ime i prezime</label>
                            <input
                                style={s.input}
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Vaše ime"
                            />
                            {errors.name && <span style={s.fieldError}>{errors.name}</span>}
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Email adresa</label>
                            <input
                                style={s.input}
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="email@primer.com"
                            />
                            {errors.email && <span style={s.fieldError}>{errors.email}</span>}
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Lozinka</label>
                            <input
                                style={s.input}
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 karaktera"
                            />
                            {errors.password && <span style={s.fieldError}>{errors.password}</span>}
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Potvrdi lozinku</label>
                            <input
                                style={s.input}
                                name="confirmPassword"
                                type="password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Ponovite lozinku"
                            />
                            {errors.confirmPassword && <span style={s.fieldError}>{errors.confirmPassword}</span>}
                        </div>

                        {apiError && (
                            <div style={s.errorBox}>
                                <span>⚠</span> {apiError}
                            </div>
                        )}

                        <button
                            style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Registracija...' : 'Registruj se →'}
                        </button>
                    </form>

                    <p style={s.loginLink}>
                        Već imate nalog?{' '}
                        <Link to="/login" style={s.link}>Prijavite se</Link>
                    </p>
                </div>
            </div>

            <div style={s.hero}>
                <div style={s.heroOverlay} />
            </div>

        </div>
    );
}

const HERO_IMG = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80';

const s = {
    root: {
        display: 'flex',
        minHeight: '100svh',
        background: 'var(--bg)',
    },

    formSide: {
        flexShrink: 0,
        width: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        background: 'var(--bg-2)',
        borderRight: '1px solid var(--border)',
    },
    formBox: {
        width: '100%',
        maxWidth: '420px',
    },
    logoWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
    },
    logoIcon: {
        width: '150px',
        height: '150px',
        objectFit: 'contain',
    },
    formHeader: {
        marginBottom: '28px',
        textAlign: 'center',
    },
    formTitle: {
        fontFamily: 'var(--serif)',
        fontSize: '28px',
        fontWeight: 500,
        color: 'var(--text-h)',
        marginBottom: '8px',
    },
    formSub: {
        color: 'var(--text)',
        fontSize: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-2)',
        letterSpacing: '0.2px',
    },
    input: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-h)',
        padding: '12px 16px',
        fontSize: '14px',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
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
    submitBtn: {
        marginTop: '4px',
        width: '100%',
        padding: '14px',
        background: 'var(--green-dark)',
        border: '1px solid var(--green)',
        color: 'var(--green-pale)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '15px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
        fontFamily: 'var(--sans)',
        letterSpacing: '0.2px',
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '28px',
        fontSize: '14px',
        color: 'var(--text)',
    },
    link: {
        color: 'var(--green-light)',
        fontWeight: 500,
    },

    hero: {
        flex: '1 1 0',
        position: 'relative',
        backgroundImage: `url(${HERO_IMG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    heroOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(160deg,rgba(8,22,13,0.4) 0%,rgba(8,22,13,0.1) 50%,rgba(8,22,13,0.4) 100%)',
    },
};