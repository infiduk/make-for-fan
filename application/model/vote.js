'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection.json');
console.log("CCP Path: " + ccpPath);
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

class VoteModel {
    // 퀴즈 등록
    setVote(key, vote) {
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
                    reject('An identity for the user does not exist in the wallet')
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction(
                    'setVote', 
                    vote.id.toString(), 
                    vote.category.toString(), 
                    vote.begin.toString(), 
                    vote.end.toString(), 
                    vote.choice1.toString(), 
                    vote.choice2.toString(),
                    vote.reward.toString()
                );
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                await gateway.disconnect();
                resolve("투표가 성공적으로 등록되었습니다.")
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 조회
    getVote(key, id) {
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
                    console.log('Run the registerUser.js application before retrying');
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
                const result = await contract.evaluateTransaction('getVote', id.toString());
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 상태로 조회 
    getVoteByStatus(status) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const adminExists = await wallet.exists('admin');
                if (!adminExists) {
                    console.log('An identity for the admin user "admin" does not exist in the wallet');
                    console.log('Run the enrollAdmin.js application before retrying');
                    reject('An identity for the admin user "admin" does not exist in the wallet')
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                const result = await contract.submitTransaction('getVoteByStatus', status.toString());
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                await gateway.disconnect();
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 전체조회
    getAllVotes(key) {
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
                    console.log('Run the registerUser.js application before retrying');
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
                const result = await contract.evaluateTransaction('getAllVotes');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
    
    // 퀴즈 이름으로 조회
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
                    console.log('Run the registerUser.js application before retrying');
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
                const result = await contract.evaluateTransaction('getUserByName', name.toString());
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch(err) {
                reject(err);
            }
        });
    }

    // 퀴즈 상태 변경
    changeVoteStatus(id) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const adminExists = await wallet.exists('admin');
                if (!adminExists) {
                    console.log('An identity for the admin user "admin" does not exist in the wallet');
                    console.log('Run the enrollAdmin.js application before retrying');
                    reject('An identity for the admin user "admin" does not exist in the wallet');
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction('changeVoteStatus', id.toString());
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                await gateway.disconnect();

                resolve(`Vote ${id} status successfully updated`);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 투표
    choice(key, vote) {
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
                    console.log('Run the registerUser.js application before retrying');
                    reject('An identity for the user does not exist in the wallet');
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction('choice', vote.id.toString(), vote.choose.toString(), vote.user.toString(), vote.value.toString());
                console.log('Transaction has been submitted');

                const result = await contract.evaluateTransaction('getUserByName', vote.user.toString());
                console.log('Transaction has been evaluated');

                // Disconnect from the gateway.
                await gateway.disconnect();

                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 이력 조회
    getHistoryByVoteId(key, id) {
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
                    console.log('Run the registerUser.js application before retrying');
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
                const result = await contract.evaluateTransaction('getHistoryByVoteId', id.toString());
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch(err) {
                reject(err);
            }
        });
    }
}

module.exports = new VoteModel();