import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './UserContext';
import ProjectList from './ProjectList';
import AdminDashboard from './AdminDashboard';
import ContractorDashboard from './ContractorDashboard';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import LedgerInfo from './LedgerInfo';

function App() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">🛡️ TransparentFlow</Link>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Public Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/technology" className="nav-link">
                Technology
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/admin" className="nav-link">
                Admin Panel
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contractor" className="nav-link">
                Contractor Panel
              </Link>
            </li>
            {currentUser ? (
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-button">
                  Logout ({currentUser.name})
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link to="/login" className="nav-link-login">
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <div className="main-content">
        <Routes>
          <Route path="/" element={<ProjectList />} />
          <Route path="/technology" element={<LedgerInfo />} /> {/* <-- 2. Add new route */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="gov_admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contractor"
            element={
              <ProtectedRoute allowedRole="contractor">
                <ContractorDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;