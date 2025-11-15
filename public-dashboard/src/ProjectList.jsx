import React, { useState, useEffect } from 'react';
import api from './api';

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await api.get('/api/projects');
                if (Array.isArray(response.data)) {
                    setProjects(response.data);
                } else {
                    setProjects([]);
                }

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch projects. Is the server running?');
                setLoading(false);
                console.error(err);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <div className="status">Loading Projects...</div>;
    if (error) return <div className="status error">{error}</div>;

    return (
        <div className="project-list">
            {projects.map((project) => (
                <div key={project.projectId} className="project-card">
                    <div className="card-header">
                        <h3>{project.title}</h3>
                        <span className={`status-badge ${project.status.toLowerCase()}`}>
                            {project.status}
                        </span>
                    </div>
                    <p><strong>ID:</strong> {project.projectId}</p>
                    <p><strong>Total Budget:</strong> {project.totalBudget.toLocaleString()}</p>
                    <p><strong>Funds Released:</strong> {project.fundsReleased.toLocaleString()}</p>

                    <h4>Milestones</h4>
                    <ul className="milestone-list">
                        {project.milestones && Array.isArray(project.milestones) && project.milestones.map((milestone) => (
                            <li key={milestone.milestoneId}>
                                <span>{milestone.description}</span>
                                <span className={`status-badge ${milestone.status.toLowerCase()}`}>
                                    {milestone.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default ProjectList;