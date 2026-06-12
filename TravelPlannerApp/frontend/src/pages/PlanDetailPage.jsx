import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import travelPlanService from '../services/travelPlanService';
import OverviewTab from '../components/tabs/OverviewTab';
import DestinationsTab from '../components/tabs/DestinationsTab';
import ActivitiesTab from '../components/tabs/ActivitiesTab';
import ExpensesTab from '../components/tabs/ExpensesTab';
import ChecklistTab from '../components/tabs/ChecklistTab';
import MapTab from '../components/tabs/MapTab';
import logoIcon from '../assets/logoTravelApp.png';
import logoFont from '../assets/TravelAppFont.png';
import { useAuth } from '../contexts/AuthContext';

const TABS = [
    { id: 'overview', label: 'Pregled' },
    { id: 'destinations', label: 'Destinacije' },
    { id: 'activities', label: 'Aktivnosti' },
    { id: 'expenses', label: 'Troskovi' },
    { id: 'checklist', label: 'Lista' },
    { id: 'map', label: 'Mapa' },
];

export default function PlanDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [plan, setPlan] = useState(null);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPlan = () => {
        setLoading(true);
        travelPlanService.getById(id)
            .then(setPlan)
            .catch(() => setError('Plan nije pronadjen ili nemate pristup.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPlan(); }, [id]);

    const handleLogout = () => { logout(); navigate('/login'); };

    if (loading) return (
        <div style={s.centered}>
            <p style={{ color: 'var(--text)' }}>Ucitavanje...</p>
        </div>
    );

    if (error) return (
        <div style={s.centered}>
            <p style={{ color: 'var(--red)' }}>{error}</p>
            <button style={s.ghostBtn} onClick={() => navigate('/')}>Nazad</button>
        </div>
    );

    return (
        <div style={s.root}>

            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <img src={logoIcon} alt="logo" style={s.navIcon} />
                    <img src={logoFont} alt="TravelApp" style={s.navFont} />
                </div>
                <div style={s.navRight}>
                    <span style={s.navEmail}>{user?.email}</span>
                    <button style={s.ghostBtn} onClick={() => navigate('/')}>Nazad</button>
                    <button style={s.ghostBtn} onClick={() => navigate(`/plans/${id}/edit`)}>Izmeni</button>
                    <button style={s.logoutBtn} onClick={handleLogout}>Odjavi se</button>
                </div>
            </nav>

            <div style={s.content}>

                <div style={s.pageHeader}>
                    <div>
                        <h1 style={s.pageTitle}>{plan.name}</h1>
                        <p style={s.pageSubtitle}>
                            {new Date(plan.startDate).toLocaleDateString('sr-RS')} — {new Date(plan.endDate).toLocaleDateString('sr-RS')}
                        </p>
                    </div>
                    <div style={s.headerRight}>
                        <div style={s.budgetBox}>
                            <span style={s.budgetLabel}>Budzet</span>
                            <span style={s.budgetValue}>{plan.budget?.toFixed(2)} €</span>
                        </div>
                        <div style={s.budgetBox}>
                            <span style={s.budgetLabel}>Preostalo</span>
                            <span style={{ ...s.budgetValue, color: plan.remainingBudget < 0 ? 'var(--red)' : 'var(--green-light)' }}>
                                {plan.remainingBudget?.toFixed(2)} €
                            </span>
                        </div>
                    </div>
                </div>

                <div style={s.tabs}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}
                            onClick={() => setTab(t.id)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <div style={s.tabContent}>
                    {tab === 'overview' && <OverviewTab plan={plan} onRefresh={fetchPlan} navigate={navigate} planId={id} />}
                    {tab === 'destinations' && <DestinationsTab planId={id} onRefresh={fetchPlan} plan={plan} />}
                    {tab === 'activities' && <ActivitiesTab planId={id} onRefresh={fetchPlan} plan={plan} />}
                    {tab === 'expenses' && <ExpensesTab planId={id} budget={plan.budget} totalExpenses={plan.totalExpenses} onRefresh={fetchPlan} plan={plan} />}
                    {tab === 'checklist' && <ChecklistTab planId={id} />}
                    {tab === 'map' && <MapTab planId={id} />}
                </div>
            </div>
        </div>
    );
}

const s = {
    root: { minHeight: '100svh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
    centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100svh', gap: '16px' },

    navbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: '100px', background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', flexShrink: 0 },
    navLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
    navIcon: { width: '80px', height: '80px', objectFit: 'contain' },
    navFont: { height: '80px', marginTop: '10px', objectFit: 'contain' },
    navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
    navEmail: { fontSize: '13px', color: 'var(--text)' },
    ghostBtn: { padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)' },
    logoutBtn: { padding: '7px 14px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)' },

    content: { maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '48px 40px', flex: 1 },

    pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' },
    pageTitle: { fontFamily: 'var(--serif)', fontSize: '36px', fontWeight: 600, color: 'var(--text-h)', letterSpacing: '-0.5px', marginBottom: '6px' },
    pageSubtitle: { fontSize: '14px', color: 'var(--text)' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '20px' },
    budgetBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
    budgetLabel: { fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' },
    budgetValue: { fontSize: '20px', fontWeight: 600, color: 'var(--text-h)' },
    shareBtn: { padding: '9px 18px', background: 'var(--green-dark)', border: '1px solid var(--green)', color: 'var(--green-pale)', borderRadius: 'var(--radius-sm)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' },

    tabs: { display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '28px' },
    tab: { padding: '10px 18px', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--sans)', borderBottom: '2px solid transparent', marginBottom: '-1px', transition: 'color 0.2s' },
    tabActive: { color: 'var(--green-light)', borderBottomColor: 'var(--green-light)' },
    tabContent: { minHeight: '300px' },
};