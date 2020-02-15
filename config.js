
var conf = {};

conf.secret = process.env.secret
conf.mailpass = process.env.mailpass
conf.mail = process.env.mail

conf.sqldb = process.env.sqldb
conf.sqlhost = process.env.sqlhost
conf.sqlpass = process.env.sqlpass
conf.sqluser = process.env.sqluser

module.exports = conf;
