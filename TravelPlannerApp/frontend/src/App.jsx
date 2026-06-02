import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PlansListPage from './pages/PlansListPage';
import CreatePlanPage from './pages/CreatePlanPage';
import PlanDetailPage from './pages/PlanDetailPage';
import EditPlanPage from './pages/EditPlanPage';
import SharedPlanPage from './pages/SharedPlanPage';
import AdminPage from './pages/AdminPage';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/register' element={<RegisterPage />} />
                    <Route path='/shared/:token' element={<SharedPlanPage />} />
                    <Route path='/' element={
                        <ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path='/plans' element={
                        <ProtectedRoute><PlansListPage /></ProtectedRoute>} />
                    <Route path='/plans/new' element={
                        <ProtectedRoute><CreatePlanPage /></ProtectedRoute>} />
                    <Route path='/plans/:id' element={
                        <ProtectedRoute><PlanDetailPage /></ProtectedRoute>} />
                    <Route path='/plans/:id/edit' element={
                        <ProtectedRoute><EditPlanPage /></ProtectedRoute>} />
                    <Route path='/admin' element={
                        <ProtectedRoute requiredRole='Admin'><AdminPage /></ProtectedRoute>} />
                    <Route path='*' element={<Navigate to='/' replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}