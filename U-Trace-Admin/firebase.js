const firebase = require('firebase/app');
const firebaseConfig = require('./controllers/config.js');
var serviceAccount = require('./controllers/serviceAccount.json');
const admin = require('firebase-admin');


var FBapp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://u-trace-332014-default-rtdb.asia-southeast1.firebasedatabase.app"
    });


    module.exports = FBapp;