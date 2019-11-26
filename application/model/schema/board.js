require('../db-connection');
const mongoose = require('mongoose');
const moment = require('../../modules/moment');

const boardSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    title: String, // 
    context: String, 
    period: String,
    choice1: String,
    choice2: String,
    writer: String, // 
    recommend: { type: Number, default: 0 },
    recommender: [{ type: String }], // 중복 추천 방지, 추천 수 계산
    date: { type: Date, default: moment.tz(Date.now().toString()) } // 게시 날짜
});

module.exports = mongoose.model('Board', boardSchema);