import React, { useState } from 'react';
import api from './api'

function ReleasePaymentForm() {
    const [projectId, setProjectId] = useState('');
    const [milestoneId, setMilestoneId] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('http://localhost:3001/api/milestones/release', { projectId, milestoneId });
            setMessage(`Success! Payment released for ${response.data.to}.`);
            setProjectId('');
            setMilestoneId('');
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Release Milestone Payment</h3>
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
                <label>Milestone ID</label>
                <input
                    type="text"
                    value={milestoneId}
                    onChange={(e) => setMilestoneId(e.target.value)}
                    placeholder="e.g., MS-01"
                    required
                />
            </div>
            <button type="submit" disabled={loading} className="button-release">
                {loading ? 'Releasing...' : 'Release Payment'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default ReleasePaymentForm;