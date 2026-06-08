import { useState, useEffect, useRef } from 'react';
import travelPlanService from '../services/travelPlanService';

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
                colorDark: '#1565C0', colorLight: '#ffffff',
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
                    <h3 style={styles.title}>🔗 Podijeli plan putovanja</h3>
                    <button style={styles.closeBtn} onClick={onClose}>✕</button>
                </div>
                <div style={styles.body}>
                    <p style={styles.desc}>Generišite link ili QR kod kojim možete podijeliti ovaj plan sa drugima.</p>
                    <div style={styles.field}>
                        <label style={styles.label}>Tip pristupa:</label>
                        <div style={styles.toggleGroup}>
                            <button style={{ ...styles.toggleBtn, ...(accessType === 'View' ? styles.toggleActive : {}) }} onClick={() => setAccessType('View')}>👁️ Samo pregled</button>
                            <button style={{ ...styles.toggleBtn, ...(accessType === 'Edit' ? styles.toggleEditActive : {}) }} onClick={() => setAccessType('Edit')}>✏️ Može uređivati</button>
                        </div>
                        <p style={styles.hint}>{accessType === 'View' ? 'Korisnik može samo pregledati plan (bez prijave).' : 'Korisnik može dodavati i mijenjati aktivnosti, troškove i checklist.'}</p>
                    </div>
                    <button style={styles.generateBtn} onClick={generate} disabled={loading}>
                        {loading ? 'Generisanje...' : '🎲 Generiši link i QR kod'}
                    </button>
                    {error && <div style={styles.error}>{error}</div>}
                    {shareData && (
                        <div style={styles.result}>
                            <div style={styles.qrContainer} ref={qrRef} />
                            <div style={styles.linkLabel}>
                                {accessType === 'View' ? '👁️ Link za pregled' : '✏️ Link za uređivanje'}
                                <span style={styles.expiry}>(važi 30 dana)</span>
                            </div>
                            <div style={styles.linkRow}>
                                <input style={styles.linkInput} value={shareData.shareUrl} readOnly onFocus={e => e.target.select()} />
                                <button style={{ ...styles.copyBtn, ...(copied ? styles.copiedBtn : {}) }} onClick={copyLink}>
                                    {copied ? '✅ Kopirano!' : '📋 Kopiraj'}
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
    overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
    modal: { backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' },
    title: { margin: 0, fontSize: '18px', color: '#1565C0' },
    closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888', padding: '4px' },
    body: { padding: '24px' },
    desc: { color: '#666', fontSize: '14px', margin: '0 0 20px 0' },
    field: { marginBottom: '20px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '10px', display: 'block' },
    toggleGroup: { display: 'flex', gap: '8px' },
    toggleBtn: { flex: 1, padding: '10px', border: '2px solid #ddd', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'white', color: '#555', fontSize: '13px' },
    toggleActive: { borderColor: '#1565C0', backgroundColor: '#e3f2fd', color: '#1565C0', fontWeight: '600' },
    toggleEditActive: { borderColor: '#e65100', backgroundColor: '#fff3e0', color: '#e65100', fontWeight: '600' },
    hint: { fontSize: '12px', color: '#888', margin: '8px 0 0 0' },
    generateBtn: { width: '100%', padding: '12px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
    error: { marginTop: '12px', padding: '10px', backgroundColor: '#ffebee', color: '#d32f2f', borderRadius: '4px', fontSize: '13px' },
    result: { marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' },
    qrContainer: { display: 'flex', justifyContent: 'center', marginBottom: '20px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' },
    linkLabel: { fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    expiry: { fontSize: '11px', color: '#888', fontWeight: 'normal' },
    linkRow: { display: 'flex', gap: '8px' },
    linkInput: { flex: 1, padding: '9px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px', color: '#333', backgroundColor: '#f9f9f9' },
    copyBtn: { padding: '9px 16px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' },
    copiedBtn: { backgroundColor: '#388e3c' },
};