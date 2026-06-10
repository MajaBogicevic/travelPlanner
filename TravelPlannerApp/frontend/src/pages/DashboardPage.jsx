import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import travelPlanService from '../services/travelPlanService';
import logoIcon from '../assets/logoTravelApp.png';
import logoFont from '../assets/TravelAppFont.png';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [sharedPlans, setSharedPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            travelPlanService.getAll(),
            travelPlanService.getSharedPlans(),
        ])
            .then(([own, shared]) => {
                setPlans(own);
                setSharedPlans(shared);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderCard = (plan, isShared = false) => {
        const start = new Date(plan.startDate);
        const end = new Date(plan.endDate);
        const days = Math.ceil((end - start) / 86400000);
        const isOver = end < new Date();
        const remaining = plan.remainingBudget ?? (plan.budget - (plan.totalExpenses || 0));

        return (
            <div
                key={plan.id}
                style={s.card}
                onClick={() => navigate(`/plans/${plan.id}`)}
                onMouseEnter={e => e.currentTarget.style.borderColor = isShared ? 'var(--amber)' : 'var(--green)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
                <div style={s.cardTop}>
                    <div style={s.cardTitleRow}>
                        <h2 style={s.cardTitle}>{plan.name}</h2>
                        <span style={{
                            ...s.statusBadge,
                            background: isOver ? 'rgba(255,255,255,0.06)' : 'var(--green-glow)',
                            color: isOver ? 'var(--text)' : 'var(--green-light)',
                            border: `1px solid ${isOver ? 'var(--border)' : 'rgba(64,145,108,0.35)'}`,
                        }}>
                            {isOver ? 'Zavrseno' : 'Planirano'}
                        </span>
                    </div>
                    {plan.description && (
                        <p style={s.cardDesc}>{plan.description}</p>
                    )}
                </div>

                <div style={s.divider} />

                <div style={s.cardMeta}>
                    <div style={s.metaItem}>
                        <span style={s.metaLabel}>Polazak</span>
                        <span style={s.metaValue}>{start.toLocaleDateString('sr-RS')}</span>
                    </div>
                    <div style={s.metaItem}>
                        <span style={s.metaLabel}>Povratak</span>
                        <span style={s.metaValue}>{end.toLocaleDateString('sr-RS')}</span>
                    </div>
                    <div style={s.metaItem}>
                        <span style={s.metaLabel}>Trajanje</span>
                        <span style={s.metaValue}>{days} dana</span>
                    </div>
                </div>

                <div style={s.budgetRow}>
                    <div style={s.budgetLeft}>
                        <span style={s.metaLabel}>Budzet</span>
                        <span style={s.budgetAmount}>{plan.budget?.toFixed(0)} €</span>
                    </div>
                    <div style={s.budgetLeft}>
                        <span style={s.metaLabel}>Preostalo</span>
                        <span style={{
                            ...s.budgetAmount,
                            color: remaining < 0 ? 'var(--red)' : 'var(--green-light)',
                        }}>
                            {remaining?.toFixed(0)} €
                        </span>
                    </div>
                </div>

                {plan.budget > 0 && (
                    <div style={s.progressTrack}>
                        <div style={{
                            ...s.progressFill,
                            width: `${Math.min(((plan.budget - remaining) / plan.budget) * 100, 100)}%`,
                            background: remaining < 0 ? 'var(--red)' : isShared ? 'var(--amber)' : 'var(--green-mid)',
                        }} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={s.root}>
            <nav style={s.navbar}>
                <div style={s.navLeft}>
                    <img src={logoIcon} alt="logo" style={s.navIcon} />
                    <img src={logoFont} alt="TravelApp" style={s.navFont} />
                </div>
                <div style={s.navRight}>
                    <span style={s.navEmail}>{user?.email}</span>
                    {user?.role === 'Admin' && (
                        <button style={s.adminBtn} onClick={() => navigate('/admin')}>
                            Admin panel
                        </button>
                    )}
                    <button style={s.logoutBtn} onClick={handleLogout}>
                        Odjavi se
                    </button>
                </div>
            </nav>

            <div style={s.content}>
                <div style={s.pageHeader}>
                    <div>
                        <h1 style={s.pageTitle}>Moja putovanja</h1>
                        <p style={s.pageSubtitle}>
                            {plans.length > 0
                                ? `${plans.length} ${plans.length === 1 ? 'putovanje' : 'putovanja'} ukupno`
                                : 'Nemate jos nijedno putovanje'}
                        </p>
                    </div>
                    <button style={s.newBtn} onClick={() => navigate('/plans/new')}>
                        + Novo putovanje
                    </button>
                </div>

                {loading && (
                    <div style={s.emptyState}>
                        <p style={{ color: 'var(--text)' }}>Ucitavanje...</p>
                    </div>
                )}

                {!loading && plans.length === 0 && (
                    <div style={s.emptyState}>
                        <h3 style={s.emptyTitle}>Nema planiranih putovanja</h3>
                        <p style={s.emptyText}>Kreirajte prvo putovanje i pocnite sa planiranjem</p>
                        <button style={s.newBtn} onClick={() => navigate('/plans/new')}>
                            + Kreiraj prvo putovanje
                        </button>
                    </div>
                )}

                <div style={s.grid}>
                    {plans.map(plan => renderCard(plan, false))}
                </div>

                {!loading && (
                    <div style={{ marginTop: '56px' }}>
                        <div style={s.pageHeader}>
                            <div>
                                <h1 style={s.pageTitle}>Deljena putovanja</h1>
                                <p style={s.pageSubtitle}>
                                    {sharedPlans.length > 0
                                        ? `${sharedPlans.length} ${sharedPlans.length === 1 ? 'putovanje' : 'putovanja'} podeljeno sa vama`
                                        : 'Nema putovanja podeljenih sa vama'}
                                </p>
                            </div>
                        </div>

                        {sharedPlans.length === 0 && (
                            <div style={s.emptyState}>
                                <h3 style={s.emptyTitle}>Nema deljenih putovanja</h3>
                                <p style={s.emptyText}>Kada neko podeli plan sa vama, pojavice se ovde</p>
                            </div>
                        )}

                        <div style={s.grid}>
                            {sharedPlans.map(plan => renderCard(plan, true))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const s = {
    root: {
        minHeight: '100svh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
    },
    navbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        height: '100px',
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
    },
    navLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    navIcon: {
        width: '80px',
        height: '80px',
        objectFit: 'contain',
    },
    navFont: {
        height: '80px',
        marginTop: '10px',
        objectFit: 'contain',
    },
    navRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    navEmail: {
        fontSize: '13px',
        color: 'var(--text)',
    },
    adminBtn: {
        padding: '7px 14px',
        background: 'var(--amber-bg)',
        border: '1px solid rgba(232,168,56,0.3)',
        color: 'var(--amber)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
    },
    logoutBtn: {
        padding: '7px 14px',
        background: 'transparent',
        border: '1px solid var(--border)',
        color: 'var(--text-2)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
        transition: 'border-color 0.2s, color 0.2s',
    },
    content: {
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '48px 40px',
        flex: 1,
    },
    pageHeader: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: '40px',
    },
    pageTitle: {
        fontFamily: 'var(--serif)',
        fontSize: '36px',
        fontWeight: 600,
        color: 'var(--text-h)',
        letterSpacing: '-0.5px',
        marginBottom: '6px',
    },
    pageSubtitle: {
        fontSize: '14px',
        color: 'var(--text)',
    },
    newBtn: {
        padding: '11px 22px',
        background: 'var(--green-dark)',
        border: '1px solid var(--green)',
        color: 'var(--green-pale)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
        transition: 'background 0.2s',
        whiteSpace: 'nowrap',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        gap: '12px',
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '8px',
    },
    emptyTitle: {
        fontFamily: 'var(--serif)',
        fontSize: '22px',
        fontWeight: 500,
        color: 'var(--text-h)',
        textTransform: 'none',
        letterSpacing: '0',
    },
    emptyText: {
        fontSize: '14px',
        color: 'var(--text)',
        marginBottom: '8px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px',
    },
    card: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    cardTop: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    cardTitleRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
    },
    cardTitle: {
        fontFamily: 'var(--serif)',
        fontSize: '18px',
        fontWeight: 500,
        color: 'var(--text-h)',
        letterSpacing: '-0.2px',
    },
    statusBadge: {
        padding: '3px 10px',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    cardDesc: {
        fontSize: '13px',
        color: 'var(--text)',
        lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    divider: {
        height: '1px',
        background: 'var(--border)',
    },
    cardMeta: {
        display: 'flex',
        gap: '20px',
    },
    metaItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    metaLabel: {
        fontSize: '11px',
        color: 'var(--text)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    metaValue: {
        fontSize: '13px',
        color: 'var(--text-2)',
        fontWeight: 500,
    },
    budgetRow: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    budgetLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    budgetAmount: {
        fontSize: '18px',
        fontWeight: 600,
        color: 'var(--text-h)',
        fontFamily: 'var(--sans)',
    },
    progressTrack: {
        height: '4px',
        background: 'var(--border)',
        borderRadius: '99px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '99px',
        transition: 'width 0.3s',
    },
};
