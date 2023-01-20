// server.js
// where your node app starts

// init project
var express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(helmet());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/:date?", function(req, res) {
  let unixTime, date;
  if (!req.params.date) {
    unixTime = Date.now();
    date = new Date();
  } else {
    // Unix time given
    if (/\d{5,}/.test(req.params.date)) {
      unixTime = parseInt(req.params.date);
      date = new Date(unixTime);
    // Date given
    } else {
      date = new Date(req.params.date);
      unixTime = date.getTime();
    }
  }
  if (date.toString() == "Invalid Date") {
    res.json({error: date.toString()});
  } else {
    res.json({unix: unixTime, utc: date.toUTCString()});
  }
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
