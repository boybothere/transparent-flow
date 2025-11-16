require('dotenv').config();
const axios = require('axios');
const { createWorker } = require('tesseract.js');
const https = require('https'); 

const API_BASE_URL = 'http://localhost:3001';
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
const CHECK_INTERVAL_MS = 15000;
const TESSERACT_LANG = 'eng';

let tesseractWorker;
let isAuditing = false;
let authToken = null;

const unsafeAgent = new https.Agent({
  rejectUnauthorized: false
});

async function loginAsAuditor() {
    console.log('🤖 AI Auditor: Logging in as admin...');
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            username: 'admin1',
            password: 'password123'
        }, {
            httpsAgent: unsafeAgent 
        });
        authToken = response.data.token;
        console.log('🤖 AI Auditor: Login successful. Token acquired.');
    } catch (error) {
        console.error('CRITICAL: AI Auditor login failed.', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

async function downloadFile(ipfsHash) {
    const url = `${IPFS_GATEWAY}${ipfsHash}`;
    console.log(`... AI: Downloading file from ${url}`);
    
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        httpsAgent: unsafeAgent
    });
    
    if (response.status !== 200) {
        throw new Error(`Failed to fetch file from IPFS: ${response.statusText}`);
    }
    return response.data;
}

async function readTextFromImage(buffer) {
    console.log('... AI: Starting Tesseract OCR... This may take a moment.');
    const { data: { text } } = await tesseractWorker.recognize(buffer);
    console.log('... AI: Tesseract OCR complete.');
    return text;
}

function cleanText(text) {
    return String(text).toLowerCase().replace(/[\s\n\r,-.:$]/g, '');
}

function analyzeInvoiceText(ocrText, milestone, project) {
    console.log('... AI: Analyzing extracted text with heuristic model...');
    
    const cleanOcrText = cleanText(ocrText || "");
    let validationErrors = [];

    if (!cleanOcrText.includes('invoice')) {
        validationErrors.push('Missing "invoice" keyword.');
    }
    if (!cleanOcrText.includes('client') && !cleanOcrText.includes('billto')) {
        validationErrors.push('Missing "client" or "bill to" keywords.');
    }
    if (!cleanOcrText.includes('date')) {
        validationErrors.push('Missing "date" keyword.');
    }
    if (!cleanOcrText.includes('total') && !cleanOcrText.includes('amount')) {
        validationErrors.push('Missing "total" or "amount" keywords.');
    }

    const cleanPaymentAmount = cleanText(milestone.paymentAmount);
    if (!cleanOcrText.includes(cleanPaymentAmount)) {
        validationErrors.push(`Invoice text does not contain correct amount (${milestone.paymentAmount}).`);
    }

    const cleanProjectId = cleanText(project.projectId);
    if (!cleanOcrText.includes(cleanProjectId)) {
        validationErrors.push(`Invoice text does not contain correct Project ID (${project.projectId}).`);
    }

    if (validationErrors.length > 0) {
        const reason = "AI FLAG: " + validationErrors.join(' ');
        return reason;
    }

    console.log('... AI: Heuristic analysis passed.');
    return null;
}

async function flagMilestone(projectId, milestoneId, reason) {
    try {
        await axios.post(`${API_BASE_URL}/api/alerts/flag-ai`, {
            projectId, milestoneId, reason
        }, {
            headers: { 'Authorization': `Bearer ${authToken}` },
            httpsAgent: unsafeAgent 
        });
        console.log(`Successfully logged AI flag for ${projectId} / ${milestoneId}`);
    } catch (error) {
        console.error(`Failed to log AI flag: ${error.message}`);
    }
}

async function runAudit() {
    if (isAuditing) return;
    isAuditing = true;
    console.log('AI Auditor: Waking up, checking for work...');
    
    try {
        const apiConfig = {
            headers: { 'Authorization': `Bearer ${authToken}` },
            httpsAgent: unsafeAgent
        };

        const response = await axios.get(`${API_BASE_URL}/api/projects`, apiConfig);
        const publicProjects = response.data;
        if (!publicProjects || publicProjects.length === 0) { isAuditing = false; return; }

        for (const publicProject of publicProjects) {
            let fullProjectDetails = null;

            for (const publicMilestone of publicProject.milestones) {
                if (publicMilestone.status === 'VERIFIED') {
                    console.log(`AI Auditor: Found VERIFIED milestone: ${publicProject.projectId} / ${publicMilestone.milestoneId}`);
                    
                    if (!fullProjectDetails) {
                        const detailResponse = await axios.get(`${API_BASE_URL}/api/projects/${publicProject.projectId}`, apiConfig);
                        fullProjectDetails = detailResponse.data;
                    }

                    const fullMilestone = fullProjectDetails.milestones.find(
                        m => m.milestoneId === publicMilestone.milestoneId
                    );

                    if (!fullMilestone || !fullMilestone.invoiceProof || !fullMilestone.invoiceProof.ipfsHash) {
                        continue;
                    }

                    const fileBuffer = await downloadFile(fullMilestone.invoiceProof.ipfsHash);
                    const ocrText = await readTextFromImage(fileBuffer);
                    const flagReason = analyzeInvoiceText(ocrText, fullMilestone, fullProjectDetails);

                    if (flagReason) {
                        console.warn(`🚨 AI AUDIT FAILED! Flagging milestone... Reason: ${flagReason}`);
                        await flagMilestone(fullProjectDetails.projectId, fullMilestone.milestoneId, flagReason);
                    } else {
                        console.log(`✅ AI AUDIT PASSED: Invoice for ${fullMilestone.milestoneId} is valid.`);
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error during audit: ${error.message}`);
    }
    
    console.log('🤖 AI Auditor: Work complete. Sleeping...');
    isAuditing = false;
}

async function startAuditor() {
    console.log('AI Auditor Service starting...');
    await loginAsAuditor();
    
    console.log('Loading Tesseract worker...');
    tesseractWorker = await createWorker('eng');
    console.log('Tesseract worker loaded.');
    
    console.log('AI Auditor (Local Tesseract Heuristic) is ready.');
    
    runAudit();
    setInterval(runAudit, CHECK_INTERVAL_MS);
}

startAuditor();