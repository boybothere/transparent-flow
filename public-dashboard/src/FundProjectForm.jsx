import React, { useState } from 'react';
import api from './api';

function FundProjectForm() {
    const [projectId, setProjectId] = useState('');
    const [amount, setAmount] = useState(0);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/api/projects/fund', {
                projectId,
                amount: parseInt(amount, 10)
            });
            setMessage(`Success! Funded ${response.data.projectId} with ${response.data.escrowBalance}.`);
            setProjectId('');
            setAmount(0);

        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.response?.data?.msg || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Fund Project Escrow</h3>
            <div className="form-group">
                <label>Project ID</label>
                <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g., HWY-001"
                    required
                />
            </div>
            <div className="form-group">
                <label>Amount to Fund</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#f0ad4e' }}>
                {loading ? 'Funding...' : 'Fund Project'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default FundProjectForm;