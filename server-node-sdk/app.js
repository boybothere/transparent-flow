'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const auth = require('./middleware/auth');

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

let org1Ccp;
let org2Ccp;
let wallet;

const TRUSTED_DEVICES = {
    "SECRET_KEY_FOR_TRUCK_001": "truck-001",
    "SECRET_KEY_FOR_TRUCK_002": "truck-002",
    "SECRET_KEY_FOR_TRUCK_003": "truck-003",
    "SECRET_KEY_FOR_AI_TRUCK": "ai-truck",
    "SECRET_KEY_FOR_HERO_TRUCK": "D-1",
    "SECRET_KEY_FOR_D1": "D-1"
    // Add any other keys you need
};

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

async function connectToGateway(orgName, userId) {
    const orgNameLower = orgName.toLowerCase();
    const ccp = (orgNameLower === 'org1') ? org1Ccp : org2Ccp;

    const identity = await wallet.get(userId);
    if (!identity) {
        throw new Error(`User identity "${userId}" not found in wallet.`);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('transparentflow');

    return { contract, gateway };
}

app.get('/api/projects', async (req, res) => {
    const orgName = 'Org1';
    const userId = 'gov-admin-1';

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log('--> Evaluating Transaction: getAllProjectsPublic');
        const result = await contract.evaluateTransaction('getAllProjectsPublic', '{}');
        await gateway.disconnect();
        console.log('*** Query successful');
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({ error: `Failed to query chaincode: ${error.message}` });
    }
});

app.get('/api/projects/:projectId', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const { projectId } = req.params;
    const argsString = JSON.stringify({ projectId });

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log('--> Evaluating Transaction: getProjectDetails');
        const result = await contract.evaluateTransaction('getProjectDetails', argsString);
        await gateway.disconnect();
        console.log('*** Query successful');
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({ error: `Failed to query chaincode: ${error.message}` });
    }
});

app.get('/api/balance/:orgName/:userId', auth, async (req, res) => {
    const { orgName, userId } = req.params;

    if (req.user.blockchainId !== userId || req.user.orgName !== orgName) {
        return res.status(403).json({ msg: 'User not authorized to check this balance' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log('--> Evaluating Transaction: getMyBalance');
        const result = await contract.evaluateTransaction('getMyBalance', '{}');
        await gateway.disconnect();
        console.log('*** Query successful');
        res.json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({ error: `Failed to query chaincode: ${error.message}` });
    }
});

app.post('/api/users', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'gov_admin') {
        return res.status(403).json({ msg: 'User does not have admin privileges' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): registerUser`);
        const result = await contract.submitTransaction('registerUser', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/projects', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'gov_admin') {
        return res.status(403).json({ msg: 'User does not have admin privileges' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): createProject`);
        const result = await contract.submitTransaction('createProject', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/devices', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'contractor') {
        return res.status(403).json({ msg: 'Only a contractor can perform this action' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): registerDevice`);
        const result = await contract.submitTransaction('registerDevice', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/milestones', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'gov_admin') {
        return res.status(403).json({ msg: 'User does not have admin privileges' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): defineMilestone`);
        const result = await contract.submitTransaction('defineMilestone', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/proof/iot', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'contractor') {
        return res.status(403).json({ msg: 'Only a contractor can perform this action' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): logIotProof`);
        const result = await contract.submitTransaction('logIotProof', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/proof/invoice', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'contractor') {
        return res.status(403).json({ msg: 'Only a contractor can perform this action' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): logInvoiceProof`);
        const result = await contract.submitTransaction('logInvoiceProof', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/milestones/release', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'gov_admin') {
        return res.status(403).json({ msg: 'User does not have admin privileges' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): releaseMilestonePayment`);
        const result = await contract.submitTransaction('releaseMilestonePayment', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/alerts/tamper', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'contractor') {
        return res.status(403).json({ msg: 'Only a contractor can perform this action' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): logTamperAlert`);
        const result = await contract.submitTransaction('logTamperAlert', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/alerts/flag-ai', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'gov_admin') {
        return res.status(403).json({ msg: 'User does not have admin privileges' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): flagMilestoneFromAI`);
        const result = await contract.submitTransaction('flagMilestoneFromAI', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/projects/approve', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body); // req.body will be {"projectId": "HWY-001"}

    // Role check: Only gov_admin can approve
    if (req.user.role !== 'gov_admin') {
        return res.status(403).json({ msg: 'User does not have admin privileges' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): approveProject`);

        const result = await contract.submitTransaction('approveProject', argsString);

        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(200).json(JSON.parse(result.toString())); // Send back the "Approval cast..." message

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/treasury/mint', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'treasury_admin') {
        return res.status(403).json({ msg: 'User must be a treasury admin' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): mintTreasuryTokens`);
        const result = await contract.submitTransaction('mintTreasuryTokens', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { username, password, blockchainId, orgName, role } = req.body;

    try {
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Username already exists' });
        }

        let bcIdCheck = await User.findOne({ blockchainId });
        if (bcIdCheck) {
            return res.status(400).json({ msg: 'Blockchain ID is already registered' });
        }

        user = new User({
            username,
            password,
            blockchainId,
            orgName,
            role
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                blockchainId: user.blockchainId,
                orgName: user.orgName
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '8h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.post('/api/projects/fund', auth, async (req, res) => {
    const orgName = req.user.orgName;
    const userId = req.user.blockchainId;
    const argsString = JSON.stringify(req.body);

    if (req.user.role !== 'gov_admin') {
        return res.status(403).json({ msg: 'User does not have admin privileges' });
    }

    try {
        const { contract, gateway } = await connectToGateway(orgName, userId);
        console.log(`--> Submitting Transaction (as ${userId}): fundProject`);
        const result = await contract.submitTransaction('fundProject', argsString);
        await gateway.disconnect();
        console.log('*** Transaction submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

app.post('/api/iot-ping', async (req, res) => {

    const orgName = 'Org2';
    const userId = 'contractor-A'; // All devices are "owned" by contractor-A

    const { apiKey, projectId, milestoneId, deviceId, iotPayload } = req.body;

    // 1. Security Check: Is this a trusted device?
    const trustedDeviceId = TRUSTED_DEVICES[apiKey];
    if (!trustedDeviceId || trustedDeviceId !== deviceId) {
        console.error(`🚨 REJECTED PING from untrusted device: ${deviceId} or bad API key.`);
        return res.status(401).json({ error: 'Unauthorized device' });
    }

    const args = { projectId, milestoneId, deviceId, iotPayload };
    const argsString = JSON.stringify(args);

    try {
        // We log in as the "contractor-A" user to submit this
        const { contract, gateway } = await connectToGateway(orgName, userId);

        console.log(`✅ PING RECEIVED (from ${deviceId}). Submitting transaction...`);
        console.log(`    Arguments: ${argsString}`);

        const result = await contract.submitTransaction('logIotProof', argsString);

        await gateway.disconnect();

        console.log('*** Transaction from device submitted successfully');
        res.status(201).json(JSON.parse(result.toString()));

    } catch (error) {
        console.error(`Failed to submit ESP32 transaction: ${error.message}`);
        res.status(500).json({ error: `Failed to submit transaction: ${error.message}` });
    }
});

async function startServer() {
    try {
        await connectDB();
        console.log('Loading connection profiles and wallet...');

        const org1CcpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        org1Ccp = JSON.parse(fs.readFileSync(org1CcpPath, 'utf8'));

        const org2CcpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        org2Ccp = JSON.parse(fs.readFileSync(org2CcpPath, 'utf8'));

        const walletPath = path.resolve(__dirname, 'cert-script', 'wallet');
        wallet = await Wallets.newFileSystemWallet(walletPath);

        console.log('Wallet and CCPs loaded successfully.');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
}

startServer();