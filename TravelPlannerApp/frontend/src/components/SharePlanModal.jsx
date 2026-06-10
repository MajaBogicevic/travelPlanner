import { useState, useEffect, useRef } from 'react';
import travelPlanService from '../services/travelPlanService';
import editIcon from '../assets/edit.png';
import eyeIcon from '../assets/eye.webp';

export default function SharePlanModal({ planId, onClose }) {
    const [accessType, setAccessType] = useState('View');
    const [shareData, setShareData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const qrRef = useRef(null);

    const generate = async () => {
        setLoading(true); setError(null);
        try {
            const data = await travelPlanService.createShareToken(planId, accessType);
            setShareData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Greška pri generisanju linka');
        } finally { setLoading(false); }
    };

    useEffect(() => {
        if (!shareData?.shareUrl || !qrRef.current) return;
        const renderQR = () => {
            if (!window.QRCode || !qrRef.current) return;
            qrRef.current.innerHTML = '';
            new window.QRCode(qrRef.current, {
                text: shareData.shareUrl, width: 180, height: 180,
                colorDark: '#40916c', colorLight: '#0f1a14',
                correctLevel: window.QRCode.CorrectLevel.M
            });
        };
        if (!window.QRCode) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.onload = renderQR;
            document.head.appendChild(script);
        } else { renderQR(); }
    }, [shareData]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareData.shareUrl);
        } catch {
            const el = document.createElement('textarea');
            el.value = shareData.shareUrl;
            document.body.appendChild(el); el.select();
            document.execCommand('copy'); document.body.removeChild(el);
        }
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Podeli plan putovanja</h3>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div style={styles.body}>
                    <div style={styles.field}>
                        <label style={styles.label}>Tip pristupa:</label>
                        <div style={styles.toggleGroup}>
                            <button style={{ ...styles.toggleBtn, ...(accessType === 'View' ? styles.toggleActive : {}) }} onClick={() => setAccessType('View')}>
                                <img src={eyeIcon} alt="Oko" style={{ width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }} />
                                <span style={{ verticalAlign: 'middle' }}>Samo pregled</span>
                            </button>
                            <button style={{ ...styles.toggleBtn, ...(accessType === 'Edit' ? styles.toggleEditActive : {}) }} onClick={() => setAccessType('Edit')}>
                                <img src={editIcon} alt="Izmeni" style={{ width: '16px', height: '16px', objectFit: 'contain', verticalAlign: 'middle', marginRight: '6px' }} />
                                <span style={{ verticalAlign: 'middle' }}>Može uređivati</span>
                            </button>
                        </div>
                        <p style={styles.hint}>{accessType === 'View' ? 'Korisnik može samo pregledati plan (bez prijave).' : 'Korisnik može dodavati i menjati aktivnosti, troškove i liste.'}</p>
                    </div>
                    <button style={styles.generateBtn} onClick={generate} disabled={loading}>
                        {loading ? 'Generisanje...' : 'Generiši link i QR kod'}
                    </button>
                    {error && <div style={styles.error}>{error}</div>}
                    {shareData && (
                        <div style={styles.result}>
                            <div style={styles.qrContainer} ref={qrRef} />
                            <div style={styles.linkLabel}>
                                {accessType === 'View' ? 'Link za pregled' : 'Link za uređivanje'}
                                <span style={styles.expiry}>(važi 30 dana)</span>
                            </div>
                            <div style={styles.linkRow}>
                                <input style={styles.linkInput} value={shareData.shareUrl} readOnly onFocus={e => e.target.select()} />
                                <button style={{ ...styles.copyBtn, ...(copied ? styles.copiedBtn : {}) }} onClick={copyLink}>
                                    {copied ? 'Kopirano!' : 'Kopiraj'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
    modal: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' },
    title: { margin: 0, fontSize: '17px', color: 'var(--text-h)', fontFamily: 'var(--serif)', fontWeight: 500 },
    closeBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: 'var(--text)', padding: '4px' },
    body: { padding: '24px' },
    desc: { color: 'var(--text)', fontSize: '14px', margin: '0 0 20px 0' },
    field: { marginBottom: '20px' },
    label: { fontSize: '13px', fontWeight: '600', color: 'var(--text-2)', marginBottom: '10px', display: 'block' },
    toggleGroup: { display: 'flex', gap: '8px' },
    toggleBtn: { flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
    toggleActive: { borderColor: 'var(--green)', background: 'var(--green-glow)', color: 'var(--green-light)', fontWeight: '600' },
    toggleEditActive: { borderColor: 'rgba(232,168,56,0.4)', background: 'var(--amber-bg)', color: 'var(--amber)', fontWeight: '600' },
    hint: { fontSize: '12px', color: 'var(--text)', margin: '8px 0 0 0' },
    generateBtn: { width: '100%', padding: '12px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'var(--sans)' },
    error: { marginTop: '12px', padding: '10px 14px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', fontSize: '13px' },
    result: { marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' },
    qrContainer: { display: 'flex', justifyContent: 'center', marginBottom: '20px', padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' },
    linkLabel: { fontSize: '13px', fontWeight: '600', color: 'var(--text-2)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    expiry: { fontSize: '11px', color: 'var(--text)', fontWeight: 'normal' },
    linkRow: { display: 'flex', gap: '8px' },
    linkInput: { flex: 1, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-2)', background: 'var(--bg)', fontFamily: 'var(--sans)', outline: 'none' },
    copyBtn: { padding: '9px 16px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', fontFamily: 'var(--sans)' },
    copiedBtn: { background: 'var(--green)', borderColor: 'var(--green-light)' },
};