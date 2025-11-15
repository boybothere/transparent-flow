import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './UserContext';

function ProtectedRoute({ children, allowedRole }) {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && currentUser.role !== allowedRole) {
        return <Navigate to="/" replace />;
    }
    return children;
}

export default ProtectedRoute;