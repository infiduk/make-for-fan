'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

class User {
    setUser(key, user) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (userExists) {
                    console.log(`An identity for the user already exists in the wallet`);
                    reject(`An identity for the user already exists in the wallet`);
                }

                // Check to see if we've already enrolled the admin user.
                const adminExists = await wallet.exists('admin');
                if (!adminExists) {
                    console.log('An identity for the admin user "admin" does not exist in the wallet');
                    console.log('Run the enrollAdmin.js application before retrying');
                    reject('An identity for the admin user "admin" does not exist in the wallet');
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

                // Get the CA client object from the gateway for interacting with the CA.
                const ca = gateway.getClient().getCertificateAuthority();
                const adminIdentity = gateway.getCurrentIdentity();

                // Register the user, enroll the user, and import the new identity into the wallet.
                const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: key, role: 'client' }, adminIdentity);
                const enrollment = await ca.enroll({ enrollmentID: key, enrollmentSecret: secret });
                const userIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate, enrollment.key.toBytes());
                wallet.import(key, userIdentity);
                console.log(`Successfully registered and enrolled admin user and imported it into the wallet.`);

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction('setUser', user.id.toString(), user.name.toString(), user.birth.toString(), user.gender.toString());
                console.log('Transaction has been submitted.');

                // Disconnect from the gateway.
                await gateway.disconnect();
                resolve(`User ${user.name} successfully registered.`);
            } catch (err) {
                console.error(`Failed to register user: ${err}`);
                reject(err);
            }
        });
    }

    getUserByName(key, name) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    reject('An identity for the user does not exist in the wallet');
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Evaluate the specified transaction.
                console.log("name: " + name);
                const result = await contract.evaluateTransaction('getUserByName', name.toString());
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new User();