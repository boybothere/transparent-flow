import React, { useState } from 'react';
import axios from 'axios';
import api from './api';

function SubmitProofForm() {
    const [iotData, setIotData] = useState({ projectId: '', milestoneId: '', deviceId: '' });
    const [invoiceData, setInvoiceData] = useState({ projectId: '', milestoneId: '', invoiceAmount: 0 });
    const [file, setFile] = useState(null);

    const [iotMessage, setIotMessage] = useState(null);
    const [invoiceMessage, setInvoiceMessage] = useState(null);

    const [iotLoading, setIotLoading] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

    const getErrorMessage = (err) => {
        let msg = "An unknown error occurred.";
        if (err.response && err.response.data) {
            if (typeof err.response.data.error === 'string') {
                msg = err.response.data.error;
            } else if (typeof err.response.data.msg === 'string') {
                msg = err.response.data.msg;
            } else if (typeof err.response.data.message === 'string') {
                msg = err.response.data.message;
            } else if (err.response.status === 401) {
                msg = "Pinata Authorization Failed. Check your .env file and restart.";
            }
        } else if (err.message) {
            msg = err.message;
        }
        return msg;
    };

    const handleIotChange = (e) => {
        setIotData({ ...iotData, [e.target.name]: e.target.value });
    };

    const handleIotSubmit = async (e) => {
        e.preventDefault();
        setIotLoading(true);
        setIotMessage(null);

        const payload = {
            ...iotData,
            iotPayload: {
                status: "DELIVERED_OK",
                location: "On-Site"
            }
        };

        try {
            const response = await api.post('/api/proof/iot', payload);
            setIotMessage(`Success! IoT proof submitted for ${response.data.projectId}`);
            setIotData({ projectId: '', milestoneId: '', deviceId: '' });
        } catch (err) {
            setIotMessage(`Error: ${getErrorMessage(err)}`);
        } finally {
            setIotLoading(false);
        }
    };

    const handleInvoiceChange = (e) => {
        setInvoiceData({ ...invoiceData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleInvoiceSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setInvoiceMessage("Error: Please select a file to upload.");
            return;
        }
        setInvoiceLoading(true);
        setInvoiceMessage("Step 1/2: Uploading file to IPFS...");

        const pinataJwt = import.meta.env.VITE_PINATA_JWT;
        if (!pinataJwt) {
            setInvoiceMessage("Error: Pinata JWT not found. Did you set up the .env file and restart?");
            setInvoiceLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const pinataResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    'Authorization': `Bearer ${pinataJwt}`
                }
            });

            const ipfsHash = pinataResponse.data.IpfsHash;
            setInvoiceMessage(`Step 2/2: File uploaded (Hash: ${ipfsHash}). Submitting to ledger...`);

            const payload = {
                projectId: invoiceData.projectId,
                milestoneId: invoiceData.milestoneId,
                invoiceAmount: parseInt(invoiceData.invoiceAmount, 10),
                ipfsHash: ipfsHash
            };

            const ledgerResponse = await api.post('/api/proof/invoice', payload);
            setInvoiceMessage(`Success! Invoice proof submitted for ${ledgerResponse.data.projectId}`);

            setInvoiceData({ projectId: '', milestoneId: '', invoiceAmount: 0 });
            setFile(null);

        } catch (err) {
            setInvoiceMessage(`Error: ${getErrorMessage(err)}`);
        } finally {
            setInvoiceLoading(false);
        }
    };


    return (
        <div className="admin-forms-container">
            <form onSubmit={handleIotSubmit} className="admin-form">
                <h3>Submit IoT Proof</h3>
                <div className="form-group">
                    <label>Project ID</label>
                    <input name="projectId" type="text" value={iotData.projectId} onChange={handleIotChange} required />
                </div>
                <div className="form-group">
                    <label>Milestone ID</label>
                    <input name="milestoneId" type="text" value={iotData.milestoneId} onChange={handleIotChange} required />
                </div>
                <div className="form-group">
                    <label>Device ID</label>
                    <input name="deviceId" type="text" value={iotData.deviceId} onChange={handleIotChange} required />
                </div>
                <button type="submit" disabled={iotLoading}>
                    {iotLoading ? 'Submitting...' : 'Submit IoT Proof'}
                </button>
                {iotMessage && <div className="form-message">{iotMessage}</div>}
            </form>

            <form onSubmit={handleInvoiceSubmit} className="admin-form">
                <h3>Submit Invoice Proof</h3>
                <div className="form-group">
                    <label>Project ID</label>
                    <input name="projectId" type="text" value={invoiceData.projectId} onChange={handleInvoiceChange} required />
                </div>
                <div className="form-group">
                    <label>Milestone ID</label>
                    <input name="milestoneId" type="text" value={invoiceData.milestoneId} onChange={handleInvoiceChange} required />
                </div>
                <div className="form-group">
                    <label>Invoice Amount</label>
                    <input name="invoiceAmount" type="number" value={invoiceData.invoiceAmount} onChange={handleInvoiceChange} required />
                </div>
                <div className="form-group">
                    <label>Invoice File</label>
                    <input name="file" type="file" onChange={handleFileChange} required />
                </div>
                <button type="submit" disabled={invoiceLoading}>
                    {invoiceLoading ? 'Uploading...' : 'Submit Invoice Proof'}
                </button>
                {invoiceMessage && <div className="form-message">{invoiceMessage}</div>}
            </form>
        </div>
    );
}

export default SubmitProofForm;