import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import travelPlanService from '../services/travelPlanService';

export default function AcceptSharePage() {
    const { token } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate(`/login?shareToken=${token}`);
            return;
        }
        travelPlanService.acceptShareToken(token)
            .then(() => navigate('/'))
            .catch(() => navigate('/'));
    }, [user, token]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <p>Ucitavanje...</p>
        </div>
    );
}