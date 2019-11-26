// DB Initialize
const timeModule = require('./modules/time');

// 외부 모듈 포함
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// 모듈
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
app.use(session({
    secret: 'secretK',
    resave: false,
    saveUninitialized: true,
}));


// 서버 설정
const PORT = 8080;
const HOST = '0.0.0.0';

app.get('/', (req, res)=>{
    res.send("Welcome!")
});

// 라우터 설정
const router = require('./router');
app.use(router);

// server start
app.listen(PORT, HOST, async () => {
    try {
        console.log("□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□");
        console.log("□□□□□□□□□□ SERVER START □□□□□□□□□□");
        console.log("□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□");
        console.log("-------- Init Vote Status --------");
        await timeModule.initVoteStatus();
        console.log("------ Init Vote Status End ------");
    } catch (err) {
        console.log(err);
    }
});
console.log(`Running on http://${HOST}:${PORT}`);
