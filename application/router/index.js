'use strict'

const express = require('express');
const router = express.Router();
const userRouter = require('./user');    // userRouter
const voteRouter = require('./vote');    // voteRouter
const boardRouter = require('./board');  // boardRouter

router.use(userRouter);
router.use(voteRouter);
router.use(boardRouter);

module.exports = router;