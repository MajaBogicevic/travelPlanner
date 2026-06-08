import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import travelPlanService from '../services/travelPlanService';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        travelPlanService.getAll()
            .then(setPlans)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Travel Planner</h1>
                <div style={styles.headerRight}>
                    <span style={styles.email}>{user?.email}</span>
                    {user?.role === 'Admin' && (
                        <button style={styles.adminBtn} onClick={() => navigate('/admin')}>
                            Admin
                        </button>
                    )}
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        Odjava
                    </button>
                </div>
            </div>

            <div style={styles.content}>
                <div style={styles.contentHeader}>
                    <h2>Moja putovanja</h2>
                    <button style={styles.newBtn} onClick={() => navigate('/plans/new')}>
                        + Novo putovanje
                    </button>
                </div>

                {loading && <p>Učitavanje...</p>}

                {!loading && plans.length === 0 && (
                    <div style={styles.empty}>
                        <p>Nemate još nijedan plan putovanja.</p>
                        <button style={styles.newBtn} onClick={() => navigate('/plans/new')}>
                            Kreirajte prvi plan
                        </button>
                    </div>
                )}

                <div style={styles.grid}>
                    {plans.map(plan => (
                        <div key={plan.id} style={styles.card}
                            onClick={() => navigate(`/plans/${plan.id}`)}>
                            <h3 style={styles.planName}>{plan.name}</h3>
                            <p style={styles.dates}>
                                {new Date(plan.startDate).toLocaleDateString()} —
                                {new Date(plan.endDate).toLocaleDateString()}
                            </p>
                            <p style={styles.description}>{plan.description}</p>
                            <div style={styles.budget}>
                                <span>Budžet: {plan.budget} €</span>
                                <span style={{ color: plan.remainingBudget < 0 ? '#d32f2f' : '#388e3c' }}>
                                    Preostalo: {plan.remainingBudget} €
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
    header: {
        backgroundColor: '#1565C0', color: 'white',
        padding: '16px 32px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center'
    },
    title: { margin: 0, fontSize: '24px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    email: { fontSize: '14px' },
    adminBtn: {
        padding: '8px 16px', backgroundColor: '#FF9800',
        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
    },
    logoutBtn: {
        padding: '8px 16px', backgroundColor: 'transparent',
        color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer'
    },
    content: { padding: '32px' },
    contentHeader: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px'
    },
    newBtn: {
        padding: '10px 20px', backgroundColor: '#1565C0',
        color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
    },
    empty: { textAlign: 'center', padding: '48px' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px'
    },
    card: {
        backgroundColor: 'white', padding: '24px',
        borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer', transition: 'transform 0.2s',
    },
    planName: { margin: '0 0 8px 0', color: '#1565C0' },
    dates: { color: '#666', fontSize: '14px', margin: '0 0 8px 0' },
    description: { color: '#444', fontSize: '14px', margin: '0 0 16px 0' },
    budget: { display: 'flex', justifyContent: 'space-between', fontSize: '14px' }
};