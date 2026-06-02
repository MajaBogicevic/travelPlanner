import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

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
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) errs.name = 'Ime je obavezno';
        if (!form.email.trim()) errs.email = 'Email je obavezan';
        if (!form.password) errs.password = 'Lozinka je obavezna';
        if (form.password.length < 6) errs.password = 'Lozinka mora imati najmanje 6 karaktera';
        if (form.password !== form.confirmPassword)
            errs.confirmPassword = 'Lozinke se ne poklapaju';
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
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Registracija</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                        <label>Ime i prezime</label>
                        <input style={styles.input} name='name' value={form.name}
                            onChange={handleChange} placeholder='Vaše ime' />
                        {errors.name && <span style={styles.error}>{errors.name}</span>}
                    </div>
                    <div style={styles.field}>
                        <label>Email</label>
                        <input style={styles.input} name='email' type='email' value={form.email}
                            onChange={handleChange} placeholder='email@example.com' />
                        {errors.email && <span style={styles.error}>{errors.email}</span>}
                    </div>
                    <div style={styles.field}>
                        <label>Lozinka</label>
                        <input style={styles.input} name='password' type='password' value={form.password}
                            onChange={handleChange} placeholder='Minimum 6 karaktera' />
                        {errors.password && <span style={styles.error}>{errors.password}</span>}
                    </div>
                    <div style={styles.field}>
                        <label>Potvrdi lozinku</label>
                        <input style={styles.input} name='confirmPassword' type='password'
                            value={form.confirmPassword} onChange={handleChange}
                            placeholder='Ponovite lozinku' />
                        {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
                    </div>
                    {apiError && <div style={styles.apiError}>{apiError}</div>}
                    <button style={styles.button} type='submit' disabled={submitting}>
                        {submitting ? 'Registracija...' : 'Registruj se'}
                    </button>
                </form>
                <p style={styles.link}>
                    Već imate nalog? <Link to='/login'>Prijavite se</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', minHeight: '100vh',
        backgroundColor: '#f5f5f5'
    },
    card: {
        backgroundColor: 'white', padding: '40px',
        borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%', maxWidth: '400px'
    },
    title: { textAlign: 'center', marginBottom: '24px', color: '#1565C0' },
    field: { marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
    input: {
        padding: '10px', borderRadius: '4px',
        border: '1px solid #ccc', fontSize: '14px'
    },
    error: { color: '#d32f2f', fontSize: '12px' },
    apiError: {
        backgroundColor: '#ffebee', color: '#d32f2f',
        padding: '10px', borderRadius: '4px', marginBottom: '16px'
    },
    button: {
        width: '100%', padding: '12px', backgroundColor: '#1565C0',
        color: 'white', border: 'none', borderRadius: '4px',
        fontSize: '16px', cursor: 'pointer'
    },
    link: { textAlign: 'center', marginTop: '16px' }
};