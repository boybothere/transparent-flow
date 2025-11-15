import React from 'react';
import RegisterDeviceForm from './RegisterDeviceForm';
import SubmitProofForm from './SubmitProofForm';
import LogTamperAlertForm from './LogTamperAlertForm'; // Import

function ContractorDashboard() {
    return (
        <div className="contractor-dashboard">
            <h2>Contractor Panel</h2>
            <SubmitProofForm />
            <hr style={{ margin: '40px 0' }} />
            <div className="admin-forms-container">
                <RegisterDeviceForm />
                <LogTamperAlertForm />
            </div>
        </div>
    );
}
export default ContractorDashboard;