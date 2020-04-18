const functions = require('firebase-functions');
const express = require('express')
const app = express()

app.post('/sendEmail', (req,res) => {
    res.end('Got the post')
})

exports.widgets = functions.https.onRequest(app);
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
