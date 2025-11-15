'use strict';

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    let orgName;
    let userId;
    let functionName;
    let argsString;

    try {
        orgName = process.argv[2];
        userId = process.argv[3];
        functionName = process.argv[4];
        argsString = process.argv[5] || '';

        if (!orgName || !userId || !functionName) {
            console.log('Usage: node invoke.js <OrgName> <UserId> <FunctionName> [JSON_Args_String]');
            console.error('ERROR: Missing required arguments.');
            process.exit(1);
        }

        const orgNameLower = orgName.toLowerCase();
        const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', `${orgNameLower}.example.com`, `connection-${orgNameLower}.json`);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const walletPath = path.join(process.cwd(), 'cert-script', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const identity = await wallet.get(userId);
        if (!identity) {
            console.error(`An identity for the user "${userId}" does not exist in the wallet. Run the register scripts first.`);
            process.exit(1);
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('transparentflow');

        console.log(`\n--> Submitting Transaction: ${functionName}`);
        console.log(`    Arguments: ${argsString}`);

        const result = await contract.submitTransaction(functionName, argsString);

        console.log(`*** Transaction has been submitted`);
        if (result && result.length > 0) {
            console.log(`*** Result: ${JSON.stringify(JSON.parse(result.toString()), null, 2)}`);
        } else {
            console.log(`*** No result returned from function.`);
        }

        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();