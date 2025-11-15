import React, { useState } from 'react';
import api from './api'

function FlagMilestoneAIForm() {
    const [formData, setFormData] = useState({ projectId: '', milestoneId: '', reason: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('http://localhost:3001/api/alerts/flag-ai', formData);
            setMessage(`Success! AI flag logged for ${response.data.projectId}`);
            setFormData({ projectId: '', milestoneId: '', reason: '' });
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Log AI Anomaly Flag</h3>
            <div className="form-group">
                <label>Project ID</label>
                <input name="projectId" type="text" value={formData.projectId} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Milestone ID</label>
                <input name="milestoneId" type="text" value={formData.milestoneId} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Reason</label>
                <input name="reason" type="text" value={formData.reason} onChange={handleChange} placeholder="e.g., Invoice mismatch" required />
            </div>
            <button type="submit" disabled={loading} className="button-flag">
                {loading ? 'Logging...' : 'Log AI Flag'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default FlagMilestoneAIForm;