require('dotenv').config()
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const express = require('express');
const Movie = require('./Models/Movie')
const multer = require('multer');
const cors = require('cors')
const multerS3 = require('multer-S3');
const aws = require('aws-sdk');


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
var upload = multer({
  storage: s3({
      dirname: '/',
      bucket: 'capstone7726',
      secretAccessKey: 'PXIplXfl2A3IZWbvZjOh6tp/0e5ajOaa7ffyk/Gs',
      accessKeyId: 'AKIA2QSHIALABCRNRCGP',
      region: 'ap-south-1',
      filename: function (req, file, cb) {
          cb(null, file.originalname); 
      }
  })
});

app.post('/upload', upload.array('file'), function (req, res, next) {
  res.send("Uploaded!");
});


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
