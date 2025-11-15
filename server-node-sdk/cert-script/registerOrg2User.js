'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const newUserId = process.argv[2];
        const newUserRole = process.argv[3];

        if (!newUserId || !newUserRole) {
            console.log('Usage: node registerOrg2User.js <new_user_id> <new_user_role>');
            console.error('ERROR: Missing required arguments: new_user_id and new_user_role');
            process.exit(1);
        }

        const ccpPath = path.resolve(__dirname, '../..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com', 'connection-org2.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        const caInfo = ccp.certificateAuthorities['ca.org2.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userIdentity = await wallet.get(newUserId);
        if (userIdentity) {
            console.log(`An identity for the user "${newUserId}" already exists in the wallet`);
            return;
        }

        const adminIdentity = await wallet.get('admin_org2');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin_org2" does not exist in the wallet');
            console.log('Run registerOrg2Admin.js first');
            return;
        }

        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin_org2');

        const secret = await ca.register({
            affiliation: 'org2.department1',
            enrollmentID: newUserId,
            role: 'client',
            attrs: [
                { name: 'role', value: newUserRole, ecert: true },
                { name: 'uuid', value: newUserId, ecert: true }
            ]
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: newUserId,
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org2MSP',
            type: 'X.509',
        };
        await wallet.put(newUserId, x509Identity);

        console.log(`Successfully registered and enrolled user "${newUserId}" (Role: ${newUserRole}) for Org2 and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register user "${process.argv[2]}": ${error}`);
        process.exit(1);
    }
}

main();