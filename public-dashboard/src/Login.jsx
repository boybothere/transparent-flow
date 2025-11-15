import React, { useState } from 'react';
import { useAuth } from './UserContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(username, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading} className="login-btn admin-btn">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {error && <div className="form-message" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>{error}</div>}
            </form>
        </div>
    );
}

export default Login;