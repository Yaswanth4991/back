require('dotenv').config()
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const express = require('express');
const Movie = require('./Models/Movie')
const multer = require('multer');
const cors = require('cors')
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');


mongoose.connect('mongodb+srv://yaswanthyash7726:yaswanthyash7726@cluster1.u36q5cl.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));


cloudinary.config({
  cloud_name: 'dec6gy3wy',
  api_key: '355514238263871',
  api_secret: 'fkxhW0wjFM1XciQrJGl6kZk-Qn0'
});


const app = express();
const port = 5000;

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cors())

// multer configuration

AWS.config.update({
  accessKeyId: 'AKIA2QSHIALAKIASP2CU',
  secretAccessKey: '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',
  region: 'ap-south-1',
});
const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'capstone7726',
    acl: 'public-read', // Set the desired access control for uploaded files
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    },
  }),
});

app.post('/upload', upload.single('file'), ...);



// routes
app.post('/api/movies', upload.single('poster'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const movie = new Movie({
      title: req.body.title,
      director: req.body.director,
      releaseYear: req.body.releaseYear,
      poster: result.secure_url
    });
    await movie.save(); 
    res.send(movie);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

app.get('/api/movies', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.send(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
});
