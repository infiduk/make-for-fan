'use strict';

const boardSchema = require('./schema/board');

class Board {
    setPost(post) {
        return new Promise(async (resolve, reject) => {
            const newPost = new boardSchema({ ...post });
            try {
                const result = await newPost.save();
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    getAllPosts() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await boardSchema.find().sort('-recommend -date');
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

  
    recommend(postId, userName) {
        return new Promise(async (resolve, reject) => {
            try {
                const post = await boardSchema.findById(postId);
                console.log(post);
                let recommender = post.recommender;
                if (recommender.includes(userName)) reject('이미 투표하셨습니다.');
                else {  
                    recommender.push(userName);
                    const result = await boardSchema.updateOne({ _id: postId }, { $set: { recommender }, $inc : { recommend: 1 }});
                    resolve(result);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    // 상세보기 (추후 개발)
    getPost(id) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await boardSchema.findById(id);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Board();