import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';

const STATUS_LABELS = { Planned: { label: 'Planirano', color: '#1565C0', bg: '#e3f2fd' }, Reserved: { label: 'Rezervisano', color: '#6a1b9a', bg: '#f3e5f5' }, Completed: { label: 'Završeno', color: '#388e3c', bg: '#e8f5e9' }, Cancelled: { label: 'Otkazano', color: '#d32f2f', bg: '#ffebee' } };
const CATEGORY_ICONS = { Transport: '✈️', Accommodation: '🏨', Food: '🍽️', Tickets: '🎫', Shopping: '🛍️', Other: '💳' };
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
                <div style={styles.errorIcon}>🔒</div>
                <h2>Link nije dostupan</h2>
                <p style={{ color: '#666' }}>{error}</p>
                <p style={{ color: '#888', fontSize: '13px' }}>Zatražite novi link od vlasnika plana.</p>
            </div>
        </div>
    );

    const { plan, accessType } = data;
    const spent = plan.totalExpenses || 0;
    const remaining = (plan.budget || 0) - spent;
    const pct = plan.budget > 0 ? Math.min((spent / plan.budget) * 100, 100) : 0;

    const TABS = [
        { id: 'overview', label: '📋 Pregled' }, { id: 'destinations', label: '📍 Destinacije' },
        { id: 'activities', label: '🎯 Aktivnosti' }, { id: 'expenses', label: '💰 Troškovi' },
        { id: 'checklist', label: '✅ Checklist' },
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <div style={styles.sharedBadge}>{accessType === 'Edit' ? '✏️ Dijeljeni plan (uređivanje)' : '👁️ Dijeljeni plan (pregled)'}</div>
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
                            {plan.description && <p style={{ color: '#555', fontSize: '14px' }}>{plan.description}</p>}
                            {plan.notes && <p style={{ color: '#777', fontSize: '13px', fontStyle: 'italic' }}>{plan.notes}</p>}
                            <div style={styles.infoGrid}>
                                <span style={styles.infoLabel}>Početak</span><span>{new Date(plan.startDate).toLocaleDateString('bs-BA')}</span>
                                <span style={styles.infoLabel}>Kraj</span><span>{new Date(plan.endDate).toLocaleDateString('bs-BA')}</span>
                                <span style={styles.infoLabel}>Trajanje</span><span>{Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / 86400000)} dana</span>
                            </div>
                        </div>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Budžet</h3>
                            {[['Ukupni budžet', plan.budget?.toFixed(2) + ' €', '#333'], ['Potrošeno', spent.toFixed(2) + ' €', '#d32f2f'], ['Preostalo', remaining.toFixed(2) + ' €', remaining < 0 ? '#d32f2f' : '#388e3c']].map(([label, val, color]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                                    <span style={{ color: '#888' }}>{label}</span><span style={{ fontWeight: '600', color }}>{val}</span>
                                </div>
                            ))}
                            <div style={{ height: '8px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: pct > 100 ? '#d32f2f' : pct > 75 ? '#FF9800' : '#388e3c', borderRadius: '4px' }} />
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
                                <div><div style={{ fontWeight: '600', fontSize: '16px' }}>{d.name}</div>{d.location && <div style={{ color: '#666', fontSize: '13px' }}>📍 {d.location}</div>}<div style={{ color: '#555', fontSize: '13px' }}>{new Date(d.arrivalDate).toLocaleDateString('bs-BA')} — {new Date(d.departureDate).toLocaleDateString('bs-BA')}</div></div>
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
                                        <div><div style={{ fontWeight: '600' }}>{act.name}</div><div style={{ fontSize: '13px', color: '#666' }}>📅 {new Date(act.date).toLocaleDateString('bs-BA')}{act.time && ` • 🕐 ${act.time}`}{act.location && ` • 📍 ${act.location}`}</div></div>
                                    </div>
                                    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', backgroundColor: s.bg, color: s.color, flexShrink: 0 }}>{s.label}</span>
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
                                    <span style={{ fontSize: '24px' }}>{CATEGORY_ICONS[exp.category] || '💳'}</span>
                                    <div><div style={{ fontWeight: '600' }}>{exp.name}</div><div style={{ fontSize: '13px', color: '#888' }}>{CATEGORY_LABELS[exp.category]} • {new Date(exp.date).toLocaleDateString('bs-BA')}</div></div>
                                </div>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{exp.amount?.toFixed(2)} €</span>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'checklist' && (
                    <div>
                        <h3 style={styles.sectionTitle}>Checklist ({plan.checklistItems?.filter(c => c.isCompleted).length || 0}/{plan.checklistItems?.length || 0} završeno)</h3>
                        {(!plan.checklistItems?.length) && <div style={styles.empty}>Nema stavki.</div>}
                        {plan.checklistItems?.map(item => (
                            <div key={item.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '14px', opacity: item.isCompleted ? 0.7 : 1, marginBottom: '8px' }}>
                                <span style={{ fontSize: '18px' }}>{item.isCompleted ? '✅' : '⬜'}</span>
                                <span style={{ fontSize: '15px', textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? '#888' : '#333' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
    centered: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
    errorCard: { textAlign: 'center', backgroundColor: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 2px 20px rgba(0,0,0,0.1)', maxWidth: '400px' },
    errorIcon: { fontSize: '48px', marginBottom: '16px' },
    header: { backgroundColor: '#1565C0', color: 'white', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' },
    sharedBadge: { display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', marginBottom: '8px' },
    title: { margin: 0, fontSize: '24px' },
    dates: { margin: '4px 0 0 0', fontSize: '14px', opacity: 0.85 },
    headerBudget: { display: 'flex', gap: '24px' },
    budgetItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    budgetLabel: { fontSize: '11px', opacity: 0.8, textTransform: 'uppercase' },
    budgetVal: { fontSize: '18px', fontWeight: 'bold', color: 'white' },
    tabBar: { backgroundColor: 'white', borderBottom: '1px solid #e0e0e0', display: 'flex', overflowX: 'auto', padding: '0 16px' },
    tabBtn: { padding: '14px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#666', borderBottom: '3px solid transparent', whiteSpace: 'nowrap' },
    tabActive: { color: '#1565C0', borderBottom: '3px solid #1565C0', fontWeight: '600' },
    content: { padding: '24px 32px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
    card: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    cardTitle: { margin: '0 0 14px 0', color: '#1565C0', fontSize: '15px', borderBottom: '1px solid #e8f0fe', paddingBottom: '8px' },
    infoGrid: { display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px', marginTop: '12px' },
    infoLabel: { color: '#888', fontWeight: '500' },
    sectionTitle: { margin: '0 0 16px 0', color: '#333', fontSize: '18px' },
    numBadge: { width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 },
    empty: { textAlign: 'center', padding: '40px', color: '#888', backgroundColor: 'white', borderRadius: '8px' },
};