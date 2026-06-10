import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';

const STATUS_LABELS = { Planned: { label: 'Planirano', color: '#1565C0', bg: '#e3f2fd' }, Reserved: { label: 'Rezervisano', color: '#6a1b9a', bg: '#f3e5f5' }, Completed: { label: 'Završeno', color: '#388e3c', bg: '#e8f5e9' }, Cancelled: { label: 'Otkazano', color: '#d32f2f', bg: '#ffebee' } };
const CATEGORY_ICONS = { Transport: '', Accommodation: '', Food: '', Tickets: '', Shopping: '', Other: '' };
const CATEGORY_LABELS = { Transport: 'Transport', Accommodation: 'Smještaj', Food: 'Hrana', Tickets: 'Ulaznice', Shopping: 'Shopping', Other: 'Ostalo' };

export default function SharedPlanPage() {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('overview');

    useEffect(() => {
        travelPlanService.getByToken(token)
            .then(setData)
            .catch(err => setError(err.response?.status === 404 ? 'Link nije validan ili je istekao.' : 'Greška pri učitavanju plana.'))
            .finally(() => setLoading(false));
    }, [token]);

    if (loading) return <div style={styles.centered}><p>Učitavanje plana...</p></div>;
    if (error) return (
        <div style={styles.centered}>
            <div style={styles.errorCard}>
                <h2 style={{ color: 'var(--text-h)', fontFamily: 'var(--serif)' }}>Link nije dostupan</h2>
                <p style={{ color: 'var(--text)' }}>{error}</p>
                <p style={{ color: 'var(--text)', fontSize: '13px' }}>Zatrazite novi link od vlasnika plana.</p>
            </div>
        </div>
    );

    const { plan, accessType } = data;
    const spent = plan.totalExpenses || 0;
    const remaining = (plan.budget || 0) - spent;
    const pct = plan.budget > 0 ? Math.min((spent / plan.budget) * 100, 100) : 0;

    const TABS = [
        { id: 'overview', label: ' Pregled' }, { id: 'destinations', label: ' Destinacije' },
        { id: 'activities', label: ' Aktivnosti' }, { id: 'expenses', label: ' Troškovi' },
        { id: 'checklist', label: ' Checklist' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <div style={styles.sharedBadge}>{accessType === 'Edit' ? '✏️ Dijeljeni plan (uređivanje)' : ' Dijeljeni plan (pregled)'}</div>
                    <h1 style={styles.title}>{plan.name}</h1>
                    <p style={styles.dates}>{new Date(plan.startDate).toLocaleDateString('bs-BA')} — {new Date(plan.endDate).toLocaleDateString('bs-BA')}</p>
                </div>
                <div style={styles.headerBudget}>
                    <div style={styles.budgetItem}><span style={styles.budgetLabel}>Budžet</span><span style={styles.budgetVal}>{plan.budget?.toFixed(2)} €</span></div>
                    <div style={styles.budgetItem}><span style={styles.budgetLabel}>Preostalo</span><span style={{ ...styles.budgetVal, color: remaining < 0 ? '#ff5252' : '#69f0ae' }}>{remaining.toFixed(2)} €</span></div>
                </div>
            </div>

            <div style={styles.tabBar}>
                {TABS.map(t => <button key={t.id} style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabActive : {}) }} onClick={() => setTab(t.id)}>{t.label}</button>)}
            </div>

            <div style={styles.content}>
                {tab === 'overview' && (
                    <div style={styles.grid}>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Informacije</h3>
                            {plan.description && <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>{plan.description}</p>}
                            {plan.notes && <p style={{ color: 'var(--text)', fontSize: '13px', fontStyle: 'italic' }}>{plan.notes}</p>}
                            <div style={styles.infoGrid}>
                                <span style={styles.infoLabel}>Početak</span><span>{new Date(plan.startDate).toLocaleDateString('bs-BA')}</span>
                                <span style={styles.infoLabel}>Kraj</span><span>{new Date(plan.endDate).toLocaleDateString('bs-BA')}</span>
                                <span style={styles.infoLabel}>Trajanje</span><span>{Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / 86400000)} dana</span>
                            </div>
                        </div>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Budžet</h3>
                            {[['Ukupni budzet', plan.budget?.toFixed(2) + ' €', 'var(--text-h)'], ['Potroseno', spent.toFixed(2) + ' €', 'var(--red)'], ['Preostalo', remaining.toFixed(2) + ' €', remaining < 0 ? 'var(--red)' : 'var(--green-light)']].map(([label, val, color]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text)' }}>{label}</span>
                                    <span style={{ fontWeight: '600', color }}>{val}</span>
                                </div>
                            ))}
                            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: pct > 100 ? 'var(--red)' : 'var(--green-mid)', borderRadius: '99px' }} />
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'destinations' && (
                    <div>
                        <h3 style={styles.sectionTitle}>Destinacije ({plan.destinations?.length || 0})</h3>
                        {(!plan.destinations?.length) && <div style={styles.empty}>Nema destinacija.</div>}
                        {plan.destinations?.map((d, i) => (
                            <div key={d.id} style={{ ...styles.card, display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                <div style={styles.numBadge}>{i + 1}</div>
                                <div><div style={{ fontWeight: '600', fontSize: '16px' }}>{d.name}</div>{d.location && <div style={{ color: '#666', fontSize: '13px' }}> {d.location}</div>}<div style={{ color: '#555', fontSize: '13px' }}>{new Date(d.arrivalDate).toLocaleDateString('bs-BA')} — {new Date(d.departureDate).toLocaleDateString('bs-BA')}</div></div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'activities' && (
                    <div>
                        <h3 style={styles.sectionTitle}>Aktivnosti ({plan.activities?.length || 0})</h3>
                        {(!plan.activities?.length) && <div style={styles.empty}>Nema aktivnosti.</div>}
                        {[...(plan.activities || [])].sort((a, b) => new Date(a.date) - new Date(b.date)).map(act => {
                            const s = STATUS_LABELS[act.status] || STATUS_LABELS.Planned;
                            return (
                                <div key={act.id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: s.color, marginTop: '5px', flexShrink: 0 }} />
                                        <div><div style={{ fontWeight: '600' }}>{act.name}</div><div style={{ fontSize: '13px', color: '#666' }}> {new Date(act.date).toLocaleDateString('bs-BA')}{act.time && ` •  ${act.time}`}{act.location && ` •  ${act.location}`}</div></div>
                                    </div>
                                    <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '500', background: 'transparent', color: s.color, border: `1px solid ${s.color}33`, flexShrink: 0 }}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {tab === 'expenses' && (
                    <div>
                        <h3 style={styles.sectionTitle}>Troškovi ({plan.expenses?.length || 0})</h3>
                        {(!plan.expenses?.length) && <div style={styles.empty}>Nema troškova.</div>}
                        {plan.expenses?.map(exp => (
                            <div key={exp.id} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                    <span style={{ fontSize: '24px' }}>{CATEGORY_ICONS[exp.category] || ''}</span>
                                    <div><div style={{ fontWeight: '600' }}>{exp.name}</div><div style={{ fontSize: '13px', color: '#888' }}>{CATEGORY_LABELS[exp.category]} • {new Date(exp.date).toLocaleDateString('bs-BA')}</div></div>
                                </div>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{exp.amount?.toFixed(2)} €</span>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'checklist' && (
                    <div>
                        <h3 style={styles.sectionTitle}>Liste ({plan.checklistItems?.filter(c => c.isCompleted).length || 0}/{plan.checklistItems?.length || 0} završeno)</h3>
                        {(!plan.checklistItems?.length) && <div style={styles.empty}>Nema stavki.</div>}
                        {plan.checklistItems?.map(item => (
                            <div key={item.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '14px', opacity: item.isCompleted ? 0.7 : 1, marginBottom: '8px' }}>
                                <span style={{ fontSize: '18px' }}>{item.isCompleted ? '' : '⬜'}</span>
                                <span style={{ fontSize: '15px', textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? 'var(--text)' : 'var(--text-h)' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100svh', background: 'var(--bg)' },
    centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100svh', background: 'var(--bg)' },
    errorCard: { textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '48px', borderRadius: 'var(--radius-lg)', maxWidth: '400px' },
    errorIcon: { fontSize: '48px', marginBottom: '16px' },
    header: { background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' },
    sharedBadge: { display: 'inline-block', background: 'var(--green-glow)', border: '1px solid rgba(64,145,108,0.35)', color: 'var(--green-light)', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', marginBottom: '10px' },
    title: { margin: 0, fontSize: '32px', fontFamily: 'var(--serif)', fontWeight: 600, color: 'var(--text-h)', letterSpacing: '-0.5px' },
    dates: { margin: '6px 0 0 0', fontSize: '14px', color: 'var(--text)' },
    headerBudget: { display: 'flex', gap: '28px' },
    budgetItem: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
    budgetLabel: { fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    budgetVal: { fontSize: '20px', fontWeight: '600', color: 'var(--text-h)', fontFamily: 'var(--sans)' },
    tabBar: { background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', display: 'flex', overflowX: 'auto', padding: '0 40px' },
    tabBtn: { padding: '14px 18px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: 'var(--text)', borderBottom: '2px solid transparent', whiteSpace: 'nowrap', fontFamily: 'var(--sans)', marginBottom: '-1px' },
    tabActive: { color: 'var(--green-light)', borderBottomColor: 'var(--green-light)' },
    content: { padding: '32px 40px', maxWidth: '1100px', margin: '0 auto' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' },
    cardTitle: { margin: '0 0 14px 0', color: 'var(--green-light)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontFamily: 'var(--sans)' },
    infoGrid: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px', marginTop: '12px' },
    infoLabel: { color: 'var(--text)', fontWeight: '500' },
    sectionTitle: { margin: '0 0 16px 0', color: 'var(--text-h)', fontSize: '18px', fontFamily: 'var(--serif)' },
    numBadge: { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 },
    empty: { textAlign: 'center', padding: '40px', color: 'var(--text)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' },
};