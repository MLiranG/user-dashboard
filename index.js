// const dotenv = require('dotenv');
// dotenv.config();
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
const jwt = require('jwt-simple')
//const fetch = require("node-fetch")
const request = require('request');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const conf = require('./config.js')
// var router = require('./api/router.js')

// console.log(conf)
// console.log(jwt.encode("a", conf.secret))
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: conf.mail,
      pass: conf.mailpass
    }
  });

const connection = sql.createPool({
    host: conf.sqlhost,
    user: conf.sqluser,
    database: conf.sqldb,
    password: conf.sqlpass
});

app.use(session({
  secret: conf.secret,
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

require('./api/router.js')(app, passport, cookies, connection, crypto, jwt, transporter, moment, request); //bodyParser
require('./api/profile.js')(app, passport, cookies, connection, crypto, jwt, transporter, moment, request, path, fs, multer);

// require('./views/app.js')

app.listen(port);
console.log('The magic happens on port ' + port);
