'use strict';

// Express
const express = require('express');
const voteRouter = express.Router();

const indexGen = require('../modules/indexGen')
const voteModel = require('../model/vote');
const timeModule = require('../modules/time');

const crypto = require('crypto');

// 투표 생성
voteRouter.post('/vote', async (req, res) => { 
    const user = req.session.user;
    const hname = crypto.createHash('sha256').update(user.name).digest('hex');
    const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
    try {
        // Request body parsing
        const vote = { 
            id      : await indexGen.generate(), 
            category: req.body.category, 
            title   : req.body.title, 
            begin   : req.body.begin, 
            end     : req.body.end,
            choice1 : req.body.choice1, 
            choice2 : req.body.choice2,
            reward  : req.body.reward
        }
        const result = await voteModel.setVote(key, vote);
        
        // Set timer
        timeModule.registerTimer(vote.id, vote.begin);
        timeModule.registerTimer(vote.id, vote.end);

        const data = { msg: '투표 생성 성공', vote: result }
        res.status(200).json({data: data});
    } catch (error) {
        const data = { msg: '투표 생성 실패' }
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 목록 조회
voteRouter.get('/vote', async (req, res) => {
    const user = req.session.user;
    const hname = crypto.createHash('sha256').update(user.name).digest('hex');
    const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
    try {
        const result = await voteModel.getAllVotes(key);
        const obj = JSON.parse(result);
        const data = { votes: obj, msg: '투표 목록 조회 성공' }
        res.status(200).json({data: data});
    } catch (error) {
        const data = { msg: '투표 목록 조회 실패' }
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 상세 조회
voteRouter.post('/vote/detail', async (req, res) => {
    const user = req.session.user;
    const hname = crypto.createHash('sha256').update(user.name).digest('hex');
    const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
    const id = req.body.id;
    try {
        const result = await voteModel.getVote(key, id);
        const obj = JSON.parse(result);
        res.status(200).json(obj);

    } catch (error) {
        const data = { msg: '투표 상세조회 실패' }
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 투표
voteRouter.post('/vote/choose', async (req, res) => {
    const user = req.session.user;
    const hname = crypto.createHash('sha256').update(user.name).digest('hex');
    const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
    const vote = {
        id: req.body.id,
        choose: req.body.choose,
        user: user.name,
        value: req.body.value
    }
    try {
        const result = await voteModel.choice(key, vote); // user 정보 최신화
        const obj = JSON.parse(result);
        req.session.user.token = obj.token;                        
        req.session.user.votes = obj.votes;                        
        req.session.user.choices = obj.choices;
        req.session.user.values = obj.values;              
        const data = { user: req.session.user, msg: '투표 성공' }   
        res.status(200).json({data: data});
    } catch (error) {
        const data = { msg: '투표 실패' }
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 퀴즈 내역 조회
voteRouter.post('/vote/history', async (req, res) => {
    const user = req.session.user;
    const hname = crypto.createHash('sha256').update(user.name).digest('hex');
    const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
    const id = req.body.id; // vote id
    try {
        const result = await voteModel.getHistoryByVoteId(key, id);
        const obj = JSON.parse(result);
        res.status(200).json({data: obj, msg: '퀴즈 내역 조회 성공'});
    } catch (error) {
        const data = { msg: '퀴즈 내역 조회 실패'};
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

module.exports = voteRouter;