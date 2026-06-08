import { useState } from 'react';
import SharePlanModal from '../SharePlanModal';

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
                            ✏️ Uredi plan
                        </button>
                        <button style={styles.shareBtn} onClick={() => setShowShare(true)}>
                            🔗 Podijeli
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
    statCard: { backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' },
    statNumber: { fontSize: '28px', fontWeight: 'bold', color: '#1565C0' },
    statLabel: { fontSize: '12px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '16px' },
    card: { backgroundColor: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '16px' },
    cardTitle: { margin: '0 0 16px 0', color: '#1565C0', fontSize: '16px', borderBottom: '1px solid #e8f0fe', paddingBottom: '8px' },
    infoRow: { display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '14px', alignItems: 'flex-start' },
    infoLabel: { color: '#888', minWidth: '130px', fontWeight: '500' },
    actionRow: { display: 'flex', gap: '12px', marginTop: '20px' },
    editBtn: { padding: '8px 18px', backgroundColor: '#1565C0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    shareBtn: { padding: '8px 18px', backgroundColor: '#388e3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' },
    budgetNumbers: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
    budgetItem: { display: 'flex', justifyContent: 'space-between', fontSize: '14px' },
    budgetValue: { fontWeight: '600', fontSize: '16px' },
    progressTrack: { height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '5px', transition: 'width 0.5s ease' },
    overBudgetWarning: { marginTop: '12px', padding: '10px', backgroundColor: '#ffebee', color: '#d32f2f', borderRadius: '4px', fontSize: '13px' },
    destGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
    destChip: { display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '6px' },
    destNum: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#1565C0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 },
};