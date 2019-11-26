const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const url = 'mongodb://ch-4ml:knifeark7677@ds339648.mlab.com:39648/heroku_x9548w8z';
mongoose.connect(url, { useNewUrlParser: true });

const db = mongoose.connection;

db.on('error', (err) => {
    console.log('Error : ', err);
});
db.on('open', () => {
    console.log('Open Event');
});
 
module.exports = db;