import React, { useState } from 'react';
import api from './api'

function RegisterDeviceForm() {
    const [deviceId, setDeviceId] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await api.post('http://localhost:3001/api/devices', { deviceId, description });
            setMessage(`Success! Device "${response.data.deviceId}" registered.`);
            setDeviceId('');
            setDescription('');
        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Register New IoT Device</h3>
            <div className="form-group">
                <label>Device ID</label>
                <input
                    type="text"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
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
            <button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Device'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default RegisterDeviceForm;