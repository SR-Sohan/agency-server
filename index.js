const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectID;
const { static } = require('express');
const fs = require('fs-extra');
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdjzs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
const port = 5000


app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('services'));
app.use(fileUpload());


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
client.connect(err => {
  const servicesCollection = client.db("creativeAgency").collection("services");
  const adminCollection = client.db("creativeAgency").collection("admin");
  const orderCollection = client.db("creativeAgency").collection("order");
  const reviewCollection = client.db("creativeAgency").collection("review");

    // Added Services item
    app.post('/addServices', (req,res)=>{
        const title = req.body.title;
        const description = req.body.description;
        const file = req.files.file;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg,'base64')
        }
        servicesCollection.insertOne({title,description,image})
        .then( result => {
          res.send(result);
        })
    });


    // Added Customer Order
    app.post('/addOrder', (req,res)=>{
      const name = req.body.name;
      const email = req.body.email;
      const project = req.body.project;
      const projectDetails = req.body.projectDetails;
      const price = req.body.price;
      const projectId= req.body.projectId;
      const file = req.files.file;
      const newImg = file.data;
      const status = req.body.status;
      const encImg = newImg.toString('base64');

      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg,'base64')
      }
      orderCollection.insertOne({name,email,project,projectDetails,price,projectId,image,status})
      .then( result => {
        res.send(result);
      })
  });



    //Added Admin
    app.post('/addAdmin', (req,res)=>{
      const email = req.body;
      console.log(email);
      adminCollection.insertOne(email)
      .then( result => {
        res.send(result);
      })
    })

    // Add Customer Review
    app.post('/addReview', (req,res)=>{
      const review = req.body;
      reviewCollection.insertOne(review)
      .then( result =>{
        res.send(result)
      })
    })

    // Services List
    app.get( '/sevicesList' , (req,res) =>{
      servicesCollection.find({})
      .toArray( (err, documets) =>{
        res.send(documets)
      })
    });

    // Find a item by id
    app.get('/findId', (req,res)=> {
      servicesCollection.find({})
      .toArray( (err, documets) =>{
        res.send(documets)
      })
    })

    // Get FeedBacks
    app.get('/feedBacks', (req,res)=>{
      reviewCollection.find({})
      .toArray( (err,documents)=>{
        res.send(documents);
      })
    })

    // Order Item get
    app.get('/orderItem',(req,res)=>{
      orderCollection.find({})
      .toArray((err,documents)=>{
        res.send(documents);
      })
    })

    // Find order by email
    app.get('/customerOrder', (req,res)=>{
      orderCollection.find({email: req.query.email})
      .toArray( (err,documents) =>{
        res.send(documents)
      })

    });

    // Find a admin
    app.get('/findAdmin', (req,res)=>{
      console.log(req.query.email);
      adminCollection.find({email: req.query.email})
      .toArray( (err,documents) =>{
        res.send(documents)
      })

    });

    // Update Status
    app.patch('/update/:id', (req, res) => {
      orderCollection.updateOne({_id: ObjectId(req.params.id)},
      {
          $set: {status: req.body.status}
      })
      .then(result => {
          res.send(result.modifiedCount > 0);
      })
    });

    //Blank api
    app.get('/',(req,res)=>{
      res.send('Heroku conected')
    })


});

app.listen(process.env.PORT || port)