import { useState } from 'react';
import SharePlanModal from '../SharePlanModal';
import travelPlanService from '../../services/travelPlanService';
import editIcon from '../../assets/edit.png';
import deleteIcon from '../../assets/delete.png';
import shareIcon from '../../assets/share.png';

export default function OverviewTab({ plan, navigate, planId }) {
    const [showShare, setShowShare] = useState(false);

    const dayCount = plan.startDate && plan.endDate
        ? Math.ceil((new Date(plan.endDate) - new Date(plan.startDate)) / (1000 * 60 * 60 * 24))
        : 0;

    const spent = plan.totalExpenses || 0;
    const budget = plan.budget || 0;
    const remaining = plan.remainingBudget ?? (budget - spent);
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const over = remaining < 0;

    return (
        <div style={styles.container}>
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{dayCount}</span>
                    <span style={styles.statLabel}>Dana putovanja</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{plan.destinations?.length || 0}</span>
                    <span style={styles.statLabel}>Destinacija</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{plan.activities?.length || 0}</span>
                    <span style={styles.statLabel}>Aktivnosti</span>
                </div>
                <div style={styles.statCard}>
                    <span style={styles.statNumber}>{plan.checklistItems?.filter(c => c.isCompleted).length || 0}/{plan.checklistItems?.length || 0}</span>
                    <span style={styles.statLabel}>Checklist</span>
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Informacije o putovanju</h3>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Naziv:</span>
                        <span>{plan.name}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Datum polaska:</span>
                        <span>{new Date(plan.startDate).toLocaleDateString('bs-BA')}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Datum povratka:</span>
                        <span>{new Date(plan.endDate).toLocaleDateString('bs-BA')}</span>
                    </div>
                    {plan.description && (
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Opis:</span>
                            <span>{plan.description}</span>
                        </div>
                    )}
                    {plan.notes && (
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Napomene:</span>
                            <span style={{ fontStyle: 'italic', color: '#555' }}>{plan.notes}</span>
                        </div>
                    )}
                    <div style={styles.actionRow}>
                        <button style={styles.editBtn} onClick={() => navigate(`/plans/${planId}/edit`)}>
                            <img src={editIcon} alt="Izmeni" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                        </button>
                        <button style={styles.shareBtn} onClick={() => setShowShare(true)}>
                            <img src={shareIcon} alt="Podeli" style={{ width: '16px', height: '18px', objectFit: 'contain' }} />
                        </button>
                        <button style={styles.deleteBtn} onClick={async () => {
                            if (window.confirm('Da li ste sigurni da želite obrisati ovaj plan?')) {
                                await travelPlanService.delete(planId);
                                navigate('/');
                            }
                        }}>
                            <img src={deleteIcon} alt="Obrisi" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                        </button>
                    </div>
                </div>

                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Budžet</h3>
                    <div style={styles.budgetNumbers}>
                        <div style={styles.budgetItem}>
                            <span style={styles.infoLabel}>Ukupni budžet</span>
                            <span style={styles.budgetValue}>{budget.toFixed(2)} €</span>
                        </div>
                        <div style={styles.budgetItem}>
                            <span style={styles.infoLabel}>Potrošeno</span>
                            <span style={{ ...styles.budgetValue, color: '#d32f2f' }}>{spent.toFixed(2)} €</span>
                        </div>
                        <div style={styles.budgetItem}>
                            <span style={styles.infoLabel}>Preostalo</span>
                            <span style={{ ...styles.budgetValue, color: over ? '#d32f2f' : '#388e3c' }}>
                                {remaining.toFixed(2)} €
                            </span>
                        </div>
                    </div>
                    <div style={styles.progressTrack}>
                        <div style={{
                            ...styles.progressFill,
                            width: `${pct}%`,
                            backgroundColor: over ? '#d32f2f' : pct > 75 ? '#FF9800' : '#388e3c'
                        }} />
                    </div>
                    <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0 0' }}>
                        {pct.toFixed(0)}% budžeta iskorišteno
                    </p>
                    {over && (
                        <div style={styles.overBudgetWarning}>
                            ⚠️ Prekoračili ste budžet za {Math.abs(remaining).toFixed(2)} €
                        </div>
                    )}
                </div>
            </div>

            {plan.destinations?.length > 0 && (
                <div style={styles.card}>
                    <h3 style={styles.cardTitle}>Destinacije</h3>
                    <div style={styles.destGrid}>
                        {plan.destinations.map((d, i) => (
                            <div key={d.id} style={styles.destChip}>
                                <span style={styles.destNum}>{i + 1}</span>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{d.name}</div>
                                    {d.location && <div style={{ fontSize: '12px', color: '#888' }}>{d.location}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showShare && (
                <SharePlanModal planId={planId} onClose={() => setShowShare(false)} />
            )}
        </div>
    );
}

const styles = {
    container: {},
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' },
    statCard: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' },
    statNumber: { fontSize: '28px', fontWeight: '700', color: 'var(--green-light)', fontFamily: 'var(--sans)' },
    statLabel: { fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '16px' },
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px' },
    cardTitle: { margin: '0 0 16px 0', color: 'var(--green-light)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontFamily: 'var(--sans)' },
    infoRow: { display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '14px', alignItems: 'flex-start' },
    infoLabel: { color: 'var(--text)', minWidth: '130px', fontWeight: '500' },
    actionRow: { display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' },
    editBtn: { padding: '8px 18px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--sans)' },
    shareBtn: { padding: '8px 18px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--sans)' },
    deleteBtn: { padding: '8px 18px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--sans)' },
    budgetNumbers: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
    budgetItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px' },
    budgetValue: { fontWeight: '600', fontSize: '16px', color: 'var(--text-h)' },
    progressTrack: { height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '99px', transition: 'width 0.5s ease' },
    overBudgetWarning: { marginTop: '12px', padding: '10px 14px', background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.3)', color: 'var(--red)', borderRadius: 'var(--radius-sm)', fontSize: '13px' },
    destGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
    destChip: { display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' },
    destNum: { width: '24px', height: '24px', borderRadius: '50%', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 },
};