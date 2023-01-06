const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new Schema({
  username: String
}, {
    versionKey: false
  });

const exerciseSchema = new Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
});

let User = mongoose.model('User', userSchema);
let Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', function(req, res) {
  User.find({}, function(err, data) {
    if (err) console.error(err);
    res.json(data);
  });
});

app.post('/api/users', function(req, res) {
  let newUser = new User({
    username: req.body.username
  });
  newUser.save();
  res.json({ username: newUser.username, _id: newUser._id });
});

app.post('/api/users/:_id/exercises', function(req, res) {
  User.findById({"_id": req.params._id}, function(err, data) {
    if (err) console.error(err);
    let newExercise = new Exercise({
      username: data.username,
      description: req.body.description,
      duration: req.body.duration
    });
    // Date optional, so if not provided, set to current date
    if (!req.body.date) {
      newExercise.date = new Date().toDateString();
    } else {
      newExercise.date = new Date(req.body.date).toDateString();
    }
    newExercise.save(function(err, data) {
      if (err) console.error(err);
      res.json({_id: req.params._id, username: data.username, date: data.date, duration: data.duration, description: data.description});
    });
  });
});

app.get('/api/users/:_id/logs', function(req, res) {
  let count = 0;
  let logs = [];
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  User.findOne({"_id": req.params._id}, function(err, data) {
    if (err) console.error(err);
    let username = data.username;
    Exercise.count({"username": username}, function(err, data) {
      if (err) console.error(err);
      count = data;
      Exercise.find({"username": username}, function(err, data) {
        if (err) console.error(err);
        let tmp = 0;
        data.forEach(function(val) {
          tmp += 1;
          if (!limit || tmp <= limit) {
            let logObj = {
              description: val.description,
              duration: val.duration,
              date: val.date
            }
            logs.push(logObj);
          }
        });
        res.json({username: username, count: count, _id: req.params._id, log: logs});
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
