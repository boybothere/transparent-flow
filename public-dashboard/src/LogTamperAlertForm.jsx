import React, { useState } from 'react';
import api from './api'

function LogTamperAlertForm() {
    const [formData, setFormData] = useState({ projectId: '', milestoneId: '', deviceId: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const payload = {
            ...formData,
            tamperPayload: {
                status: "TAMPER_ALERT",
                location: "Simulated Alert Location"
            }
        };

        try {
            const response = await api.post('http://localhost:3001/api/alerts/tamper', payload);
            setMessage(`Success! Tamper alert logged for ${response.data.projectId}`);
            setFormData({ projectId: '', milestoneId: '', deviceId: '' });
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Log IoT Tamper Alert</h3>
            <div className="form-group">
                <label>Project ID</label>
                <input name="projectId" type="text" value={formData.projectId} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Milestone ID</label>
                <input name="milestoneId" type="text" value={formData.milestoneId} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Device ID</label>
                <input name="deviceId" type="text" value={formData.deviceId} onChange={handleChange} required />
            </div>
            <button type="submit" disabled={loading} className="button-flag">
                {loading ? 'Logging...' : 'Log Tamper Alert'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default LogTamperAlertForm;