import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoIcon from '../assets/logoTravelApp.png';
import logoFont from '../assets/TravelAppFont.png';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [apiError, setApiError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setApiError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim() || !form.password) {
            setApiError('Email i lozinka su obavezni');
            return;
        }
        setSubmitting(true);
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            setApiError(err.response?.data?.message || 'Pogresni podaci za prijavu');
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
                        <h2 style={s.formTitle}>Dobrodošli nazad</h2>
                        <p style={s.formSub}>Prijavite se na vaš nalog</p>
                    </div>

                    <form onSubmit={handleSubmit} autoComplete="off" style={s.form}>
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
                        </div>

                        <div style={s.field}>
                            <label style={s.label}>Lozinka</label>
                            <input
                                style={s.input}
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
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
                            {submitting ? 'Prijava...' : 'Prijavi se →'}
                        </button>
                    </form>

                    <p style={s.registerLink}>
                        Nemate nalog?{' '}
                        <Link to="/register" style={s.link}>Registrujte se</Link>
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
        marginBottom: '40px',
    },
    logoIcon: {
        width: '150px',
        height: '150px',
        objectFit: 'contain',
    },
    logoFont: {
        height: '200px',
        objectFit: 'contain',
    },

    formHeader: {
        marginBottom: '32px',
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
    registerLink: {
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