import React, { useState } from 'react';
import api from './api';

function CreateProjectForm({ onProjectCreated }) {
    const [projectId, setProjectId] = useState('');
    const [title, setTitle] = useState('');
    const [contractorId, setContractorId] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const projectData = {
            projectId,
            title,
            contractorId
        };

        try {
            const response = await api.post('http://localhost:3001/api/projects', projectData);
            setMessage(`Success! Project "${response.data.title}" created.`);

            setProjectId('');
            setTitle('');
            setContractorId('');

            if (onProjectCreated) {
                onProjectCreated();
            }

        } catch (err) {
            setMessage(`Error: ${err.response?.data?.error || err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h3>Create New Project</h3>
            <div className="form-group">
                <label>Project ID</label>
                <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Contractor ID</label>
                <input
                    type="text"
                    value={contractorId}
                    onChange={(e) => setContractorId(e.target.value)}
                    placeholder="e.g., contractor-A"
                    required
                />
            </div>
            <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
            </button>
            {message && <div className="form-message">{message}</div>}
        </form>
    );
}

export default CreateProjectForm;