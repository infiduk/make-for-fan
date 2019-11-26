'use strict'; // 엄격 모드, 현대식 코드

const moment = require('./moment');
const crypto = require('crypto');

class Generator {
    generate = () => {
        return new Promise(async (resolve, reject) => {
            try {
                const now = moment().format("x")
                const random = await crypto.randomBytes(256);
                const index = crypto.createHash('sha256').update(now + random.toString('hex')).digest('hex')
                resolve(index);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new Generator();
