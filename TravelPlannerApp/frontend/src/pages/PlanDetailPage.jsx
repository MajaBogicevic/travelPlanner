import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';
import OverviewTab from '../components/tabs/OverviewTab';
import DestinationsTab from '../components/tabs/DestinationsTab';
import ActivitiesTab from '../components/tabs/ActivitiesTab';
import ExpensesTab from '../components/tabs/ExpensesTab';
import ChecklistTab from '../components/tabs/ChecklistTab';
import MapTab from '../components/tabs/MapTab';

const TABS = [
    { id: 'overview', label: '?? Pregled' },
    { id: 'destinations', label: '?? Destinacije' },
    { id: 'activities', label: '?? Aktivnosti' },
    { id: 'expenses', label: '?? Troškovi' },
    { id: 'checklist', label: '? Checklist' },
    { id: 'map', label: '??? Mapa' },
];

export default function PlanDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPlan = () => {
        setLoading(true);
        travelPlanService.getById(id)
            .then(setPlan)
            .catch(() => setError('Plan nije prona?en ili nemate pristup.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPlan(); }, [id]);

    if (loading) return (
        <div style={styles.centered}>
            <p style={{ color: '#666' }}>U?itavanje...</p>
        </div>
    );

    if (error) return (
        <div style={styles.centered}>
            <p style={{ color: '#d32f2f' }}>{error}</p>
            <button style={styles.backBtn} onClick={() => navigate('/')}>? Nazad</button>
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <button style={styles.backBtn} onClick={() => navigate('/')}>? Nazad</button>
                    <div>
                        <h1 style={styles.title}>{plan.name}</h1>
                        <p style={styles.dates}>
                            {new Date(plan.startDate).toLocaleDateString('bs-BA')} —{' '}
                            {new Date(plan.endDate).toLocaleDateString('bs-BA')}
                        </p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <div style={styles.budgetBox}>
                        <span style={styles.budgetLabel}>Budžet</span>
                        <span style={styles.budgetAmount}>{plan.budget?.toFixed(2)} €</span>
                    </div>
                    <div style={styles.budgetBox}>
                        <span style={styles.budgetLabel}>Preostalo</span>
                        <span style={{
                            ...styles.budgetAmount,
                            color: plan.remainingBudget < 0 ? '#ff5252' : '#69f0ae'
                        }}>
                            {plan.remainingBudget?.toFixed(2)} €
                        </span>
                    </div>
                    <button style={styles.editBtn} onClick={() => navigate(`/plans/${id}/edit`)}>
                        ?? Uredi
                    </button>
                </div>
            </div>

            <div style={styles.tabBar}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabActive : {}) }}
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div style={styles.content}>
                {tab === 'overview' && <OverviewTab plan={plan} onRefresh={fetchPlan} navigate={navigate} planId={id} />}
                {tab === 'destinations' && <DestinationsTab planId={id} onRefresh={fetchPlan} />}
                {tab === 'activities' && <ActivitiesTab planId={id} onRefresh={fetchPlan} />}
                {tab === 'expenses' && <ExpensesTab planId={id} budget={plan.budget} totalExpenses={plan.totalExpenses} onRefresh={fetchPlan} />}
                {tab === 'checklist' && <ChecklistTab planId={id} />}
                {tab === 'map' && <MapTab planId={id} />}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
    centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' },
    header: {
        backgroundColor: '#1565C0', color: 'white',
        padding: '20px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px'
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
    backBtn: {
        padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)',
        color: 'white', border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
    },
    title: { margin: 0, fontSize: '22px' },
    dates: { margin: '4px 0 0 0', fontSize: '13px', opacity: 0.85 },
    budgetBox: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    budgetLabel: { fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' },
    budgetAmount: { fontSize: '18px', fontWeight: 'bold', color: 'white' },
    editBtn: {
        padding: '8px 20px', backgroundColor: '#FF9800',
        color: 'white', border: 'none', borderRadius: '4px',
        cursor: 'pointer', fontSize: '14px'
    },
    tabBar: {
        backgroundColor: 'white', borderBottom: '1px solid #e0e0e0',
        display: 'flex', overflowX: 'auto', padding: '0 16px'
    },
    tabBtn: {
        padding: '14px 20px', border: 'none', backgroundColor: 'transparent',
        cursor: 'pointer', fontSize: '14px', color: '#666',
        borderBottom: '3px solid transparent', whiteSpace: 'nowrap',
        transition: 'all 0.2s'
    },
    tabActive: {
        color: '#1565C0', borderBottom: '3px solid #1565C0', fontWeight: '600'
    },
    content: { padding: '24px 32px' }
};