import React, { useState } from 'react';
import api from './api';

function RegisterLedgerUserForm() {
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        organization: '',
        role: ''
    });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const { userId, name, organization, role } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/api/users', formData);
            setMessage(`Success! User "${response.data.userId}" registered on the ledger.`);
            // Clear the form
            setFormData({ userId: '', name: '', organization: '', role: '' });

        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.response?.data?.msg || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Register User on Ledger</h3>
            <div className="form-group">
                <label>User ID (from wallet)</label>
                <input
                    type="text"
                    name="userId"
                    value={userId}
                    onChange={handleChange}
                    placeholder="e.g., gov-admin-1"
                    required
                />
            </div>
            <div className="form-group">
                <label>Full Name</label>
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    placeholder="e.g., Government Admin"
                    required
                />
            </div>
            <div className="form-group">
                <label>Organization (MSP)</label>
                <input
                    type="text"
                    name="organization"
                    value={organization}
                    onChange={handleChange}
                    placeholder="e.g., Org1MSP"
                    required
                />
            </div>
            <div className="form-group">
                <label>Role</label>
                <input
                    type="text"
                    name="role"
                    value={role}
                    onChange={handleChange}
                    placeholder="e.g., gov_admin"
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register User'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default RegisterLedgerUserForm;