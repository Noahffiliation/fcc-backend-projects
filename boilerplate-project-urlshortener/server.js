require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require('valid-url');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const shortId = require('shortid');
const { Schema } = mongoose;

mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

const URLSchema = new Schema({
  original_url: String,
  short_url: String
});

let URL = mongoose.model('URL', URLSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:short_url?', function(req, res) {
  let url = req.params.short_url;
  URL.findOne({short_url: url}, function(err, data) {
    if (err) console.error(err);
    res.redirect(data.original_url);
  });
});

app.post('/api/shorturl', function(req, res) {
  let url = req.body.url;
  if (!validUrl.isWebUri(url)){
    res.json({error: 'invalid url'})
  } else {
    let urlID = shortId.generate();
    let found = URL.findOne({
      original_url: url
    });
    found = new URL({
      original_url: url,
      short_url: urlID
    });
    found.save();
    res.json({original_url: found.original_url, short_url: found.short_url});
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
