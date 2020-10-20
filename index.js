const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(fileUpload());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wanio.mongodb.net/CreativeAgency?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const serviceCollection = client.db("CreativeAgency").collection("Service");
    app.post('/addService', (req,res) => {
        const category = req.body.category;
        const desc = req.body.desc;
        const file = req.files.file;
        const newImg = req.files.file.data;
        const encImg = newImg.toString('base64');
        const img = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        serviceCollection.insertOne({category,desc,img}).
        then( result => {
            res.send(result.insertedCount>0);
        })
    })
    app.get('/allService', (req,res) => {
        serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })
    app.get('/byCategory', (req,res) => {
        const category = req.query.category;
        serviceCollection.find({category:category})
        .toArray((err,documents) => {
            res.send(documents);
        })
    })
    const feedbackCollection = client.db("CreativeAgency").collection("Feedback");
    app.post('/addFeedback', (req,res) => {
        const feedback = req.body;
        feedbackCollection.insertOne(feedback)
        .then(result => {
            res.send(result.insertedCount>0)
        })
    })
    app.get('/allFeedback', (req,res) => {
        feedbackCollection.find({})
        .toArray((err,documents) => {
            res.send(documents);
        })
    })
    const adminCollection = client.db("CreativeAgency").collection("Admin");
    app.post('/addAdmin', (req,res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
        .then(result => {
            if(result){
                res.send(result.insertedCount>0);
            }
        })
    })
    app.post('/isAdmin', (req,res) => {
        const email = req.body.admin;
        adminCollection.find({admin:email})
        .toArray((err, documents) => {
            if(documents[0]){
                res.send({'admin': true})
            }
            else{
                res.send({'admin': false})
            }
        })
    })
    const orderCollection = client.db("CreativeAgency").collection("Order");
    app.post('/placeOrder', (req, res) => {
        const client = req.body.client;
        const email = req.body.email;
        const orderDate = req.body.date;
        const category = req.body.category;
        const orderDetails = req.body.orderDetails;
        const price = req.body.price;
        const file = req.files.file;
        const newImg = req.files.file.data;
        const encImg = newImg.toString('base64')
        const img = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        orderCollection.insertOne({client,email,orderDate,category,orderDetails,price,img})
        .then( result => {
            res.send(result.insertedCount > 0)
        })
    })
    app.get('/allOrder', (req,res) => {
        orderCollection.find({})
        .toArray((err,documents) => {
            res.send(documents);
        })
    })
    app.get('/orderbyUser', (req,res) => {
        const userEmail = req.query.email;
        orderCollection.find({email:userEmail})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })
});

app.listen(process.env.PORT || 7000);