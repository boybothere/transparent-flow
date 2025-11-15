import React, { useState } from 'react';
import api from './api';

function DefineMilestoneForm() {
    const [projectId, setProjectId] = useState('');
    const [milestoneId, setMilestoneId] = useState('');
    const [description, setDescription] = useState('');
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [assignedDeviceId, setAssignedDeviceId] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const milestoneData = {
            projectId,
            milestoneId,
            description,
            paymentAmount: parseInt(paymentAmount, 10),
            assignedDeviceId
        };

        try {
            const response = await api.post('http://localhost:3001/api/milestones', milestoneData);
            setMessage(`Success! Milestone "${response.data.milestones[response.data.milestones.length - 1].milestoneId}" added to project "${response.data.projectId}".`);

            // Clear the form
            setProjectId('');
            setMilestoneId('');
            setDescription('');
            setPaymentAmount(0);
            setAssignedDeviceId('');

        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Define New Milestone</h3>
            <div className="form-group">
                <label>Project ID</label>
                <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="e.g., HWY-004"
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
            <div className="form-group">
                <label>Description</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Assigned Device ID</label>
                <input
                    type="text"
                    value={assignedDeviceId}
                    onChange={(e) => setAssignedDeviceId(e.target.value)}
                    placeholder="e.g., truck-789-seal"
                    required
                />
            </div>
            <div className="form-group">
                <label>Payment Amount</label>
                <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Defining...' : 'Define Milestone'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default DefineMilestoneForm;