// 1. 외부 모듈 포함
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
// 게이트 웨이 접근
// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
// Key 접근
// Create a new file system based wallet for managing identities.
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);
console.log(`Wallet path: ${walletPath}`);
// await 때문에 밑으로 내림
// // Check to see if we've already enrolled the user.
// const userExists = await wallet.exists('user1');
// if (!userExists) {
//     console.log('An identity for the user "user1" does not exist in the wallet');
//     console.log('Run the registerUser.js application before retrying');
//     return;
// }

// 2. 서버 설정
// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

// 3. 라우팅
// 3.1 /
app.get('/', (req,res)=>{
    res.send("Welcome!")
})

// 3.2 GET /keys
app.get('/', async function (req, res) {
    // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    // Create a new gateway for connecting to our peer node.
    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('sacc');

    // Evaluate the specified transaction.
    // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
    // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
    const result = await contract.evaluateTransaction('getAllKeys');
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    var obj = JSON.parse(result);
    res.status(200).json(obj);
});

// 3.4 GET /vote/:id - 조회

// 3.5 PUT /key/:id - 수정

// 3.6 DELETE /key/:id 생성
