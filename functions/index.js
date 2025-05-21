// // The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
// const {onRequest} = require("firebase-functions/v2/https");

// // The Firebase Admin SDK to access Firestore.
// const {initializeApp} = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");
// // var serviceAccount = require('./calculator-7b8e5-firebase-adminsdk-fbsvc-8cb1244f6d.json');
// var admin = require('firebase-admin');
// // admin.initializeApp();

// // import { initializeApp } from "firebase/app";
// // import { getAnalytics } from "firebase/analytics";
// // // TODO: Add SDKs for Firebase products that you want to use
// // // https://firebase.google.com/docs/web/setup#available-libraries

// // // Your web app's Firebase configuration
// // // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// // const firebaseConfig = {
// //   apiKey: "AIzaSyAtyrFK2SZVVURiOg_HEbaaIESsuwgqbbE",
// //   authDomain: "calculator-7b8e5.firebaseapp.com",
// //   projectId: "calculator-7b8e5",
// //   storageBucket: "calculator-7b8e5.firebasestorage.app",
// //   messagingSenderId: "1060964128199",
// //   appId: "1:1060964128199:web:6bb62869c3bfa4ab23b5e2",
// //   measurementId: "G-3828R0Z2HW"
// // };

// // // Initialize Firebase
// // const app = initializeApp(firebaseConfig);
// // const analytics = getAnalytics(app);

// var serviceAccount = require("./calculator-7b8e5-firebase-adminsdk-fbsvc-d1be4b1b29.json");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
//   const db = admin.firestore();

// exports.addUser = onRequest(async (req, res) => {

//     // const db = admin.firestore();
//     // const snapshot = db.collection('users').get();
//     // snapshot.forEach((doc) => {
//     //   console.log(doc.id, '=>', doc.data());
//     // });
//     const docRef =  await getFirestore().collection('user').doc('alovelace');

// await docRef.set({
//   first: 'Ada',
//   last: 'Lovelace',
// });

// console.log(req.method );

//     res.send({result: "Message with ID: added."});
// });


// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const {onRequest} = require("firebase-functions/v2/https");
// const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
const {initializeApp,applicationDefault } = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
// var serviceAccount = require('./calculator-7b8e5-firebase-adminsdk-fbsvc-8cb1244f6d.json');
const {MongoClient} = require('mongodb');

var admin = require('firebase-admin');
var serviceAccount = require("./calculator-7b8e5-firebase-adminsdk-fbsvc-d1be4b1b29.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
  const db =  admin.firestore();
// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original

const client = new MongoClient(
    'mongodb+srv://ngotritoan33:yeDMQJan0cWhxaKE@lawmachine.f9sj5mz.mongodb.net/',
  );

  
exports.addUser = onRequest(async (req, res) => {
    if (req.method === 'POST') {
    
        try {
          const database = client.db('data');
          const Location = database.collection('location');
    
          await Location.insertOne({ name: req.body.name, location:`${req.body.latitude}, ${req.body.longitude}`,time:req.body.time });
          res.send({result: "Message with ID: added."});
        } finally {
        }
    }
    });

    exports.searchDetail = onRequest(async (req, res) => {
      if (req.method === 'POST') {
    
        try {
          const database = client.db('data');
          const Location = database.collection('location');
    
          Location.find({
            $or: [
              {name: new RegExp(`${req.body.searchInput}`, 'i')},
            ],
          })
            // .project({info: 1})
            .sort({_id:-1})
            .toArray()
            .then(o => res.json(o));
        } finally {
        }
      }
    });
    