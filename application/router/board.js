'use strict'

// Express
const express = require('express');
const boardRouter = express.Router();
const boardModel = require('../model/board');

boardRouter.post('/post', async (req, res) => {
    const user = req.session.user;
    const post = {
        title: req.body.title,
        context: req.body.context,
        period: req.body.period, // 희망 투표 기간(일)
        choice1: req.body.choice1,
        choice2: req.body.choice2,
        writer: user.name
    }
    try {
        const result = await boardModel.setPost(post);
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(`err msg`);
    }
});

boardRouter.get('/post', async (req, res) => {
    try {
        const result = await boardModel.getAllPosts();
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(`err msg`);
    }
});

boardRouter.post('/post/recommend', async (req, res) => {
    const user = req.session.user;
    const postId = req.body.postId;
    try {
        const result = await boardModel.recommend(postId, user.name);
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(`err msg`);
    }
});

module.exports = boardRouter;