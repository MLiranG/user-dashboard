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
const conf = require('./config.js')
const jwt = require('jwt-simple')
//const fetch = require("node-fetch")
const request = require('request');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const path = require("path");
const fs = require("fs");
const multer = require("multer");
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

app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {} //in prod it will be {secure: true}
}))

// connection.query()

app.set('views', __dirname + '/views/pages');
app.use(express.static('./api/files'))
app.use('/css',express.static(__dirname +'/views/css'));
app.engine('html', require('ejs').renderFile);
app.use(cookies());
app.use(bodyParser())
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload())

require('./api/router.js')(app, passport, cookies, connection, crypto, conf, transporter, jwt, moment, request); //bodyParser
require('./api/profile.js')(app, passport, cookies, connection, crypto, conf, transporter, jwt, moment, request, path, fs, multer);

// require('./views/app.js')

app.listen(port);
console.log('The magic happens on port ' + port);
