import React, { useState } from 'react';
import api from './api';

function ApproveProjectForm() {
    const [projectId, setProjectId] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('/api/projects/approve', { projectId });

            setMessage(`Success: ${response.data.message} (${response.data.approvals}/${response.data.required}). New Status: ${response.data.newStatus}`);
            setProjectId('');

        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.response?.data?.msg || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Approve Project Proposal</h3>
            <div className="form-group">
                <label>Project ID to Approve</label>
                <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g., HWY-001"
                    required
                />
            </div>
            <button type="submit" disabled={loading} style={{ backgroundColor: '#0275d8' }}>
                {loading ? 'Casting Vote...' : 'Cast Approval Vote'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default ApproveProjectForm;