const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const sql = require('mysql2');
const passport = require('passport');
const flash = require('connect-flash');
const moment = require("moment")
const cookies = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const conf = require('./config.json')
const jwt = require('jwt-simple')
const fetch = require("node-fetch")
const request = require('request');
// var router = require('./api/router.js')
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'LiranForweb@gmail.com',
      pass: conf.mailpass
    }
  });

const connection = sql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'm1',
    password: conf.sqlpass
});


// connection.query()

app.set('views', __dirname + '/views/pages');
app.use('/css',express.static(__dirname +'/views/css'));
app.engine('html', require('ejs').renderFile);
app.use(cookies());
app.use(bodyParser())
app.use(passport.initialize());
app.use(passport.session());


require('./api/router.js')(app, passport, cookies, connection, crypto, transporter, conf, jwt, moment, fetch, request); //bodyParser
require('./api/profile.js')(app, passport, cookies, connection, crypto, transporter, conf, jwt, moment, fetch, request);

// require('./views/app.js')

app.listen(port);
console.log('The magic happens on port ' + port);