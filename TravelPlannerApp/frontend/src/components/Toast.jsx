import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';

export default function Toast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        return toast.subscribe((t) => {
            setToasts(prev => [...prev, t]);
            setTimeout(() => {
                setToasts(prev => prev.filter(x => x.id !== t.id));
            }, 3000);
        });
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div style={styles.container}>
            {toasts.map(t => (
                <div key={t.id} style={{ ...styles.toast, ...(t.type === 'success' ? styles.success : styles.error) }}>
                    {t.message}
                </div>
            ))}
        </div>
    );
}

const styles = {
    container: { position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 2000 },
    toast: { padding: '12px 18px', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontFamily: 'var(--sans)', boxShadow: 'var(--shadow-lg)', minWidth: '220px', border: '1px solid', background: 'var(--bg-card)' },
    success: { borderColor: 'rgba(64,145,108,0.35)', color: 'var(--green-light)' },
    error: { borderColor: 'rgba(224,92,92,0.3)', color: 'var(--red)' },
};