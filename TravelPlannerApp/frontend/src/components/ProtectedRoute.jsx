import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { user } = useAuth();

    if (!user) return <Navigate to='/login' replace />;
    if (requiredRole && user.role !== requiredRole) return <Navigate to='/' replace />;

    return children;
}