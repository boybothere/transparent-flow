import React from 'react';
import CreateProjectForm from './CreateProjectForm';
import DefineMilestoneForm from './DefineMilestoneForm'; // <-- It's here
import ReleasePaymentForm from './ReleasePaymentForm';
import FlagMilestoneAIForm from './FlagMilestoneAIForm';
import RegisterLedgerUserForm from './RegisterLedgerUserForm';
import FundProjectForm from './FundProjectForm';
import ApproveProjectForm from './ApproveProjectForm';

function AdminDashboard() {

    const refreshPublicList = () => {
        console.log("A new project was created! Check the public list.");
    };

    return (
        <div className="admin-dashboard">
            <h2>Government Admin Panel</h2>

            <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                Step 1: Register all users on the ledger first.
            </p>
            <div className="admin-forms-container" style={{ gridTemplateColumns: "1fr" }}>
                <RegisterLedgerUserForm />
            </div>

            <hr style={{ margin: '40px 0' }} />

            <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                Step 2: Propose, Approve, Fund, and Define Milestones.
            </p>
            {/* This grid now has 4 items. We'll let the CSS handle it.
                It will probably be 2x2 on most screens, which is fine.
            */}
            <div className="admin-forms-container">
                <CreateProjectForm onProjectCreated={refreshPublicList} />
                <ApproveProjectForm />
                <FundProjectForm />
                <DefineMilestoneForm /> {/* <-- ADDED IT BACK HERE */}
            </div>

            <hr style={{ margin: '40px 0' }} />

            <p style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                Step 3: Manage Live Milestones (Release or Flag).
            </p>
            <div className="admin-forms-container">
                <ReleasePaymentForm />
                <FlagMilestoneAIForm />
            </div>
        </div>
    );
}
export default AdminDashboard;