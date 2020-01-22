module.exports = function (app, passport, cookies, connection, crypto, transporter, conf, jwt, moment, fetch, request) {

    function createsalt(length) {
        return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0, length); /** return required number of characters */
    };

    function hash(password, salt) {
        var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
        hash.update(password);
        var value = hash.digest('hex');
        return {
            salt: salt,
            passwordHash: value
        };
    };

    function verificate(email, res) {
        connection.query(`SELECT verified FROM register WHERE email = '${email}'`, function (err, rows, fields) {
            if (err) {
                console.error(err)
            } else {
                if (!rows[0]) {
                    res.send('No account with that email, please check it again')
                } else {
                    if (rows[0].verified == 1) {
                        res.send('This account already verified')
                    } else if (rows[0].verified == 0) {
                        let info = {};
                        info.user = email;
                        info.expiry = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                        let token = jwt.encode(info, conf.secret);
                        console.log("http://localhost:8080/verify/register/" + token);

                        transporter.sendMail({
                            from: '"LiranB work" <LiranForweb@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: "Email verification", // Subject line
                            text: "Hello world?", // plain text body
                            html: `<b><h1>Hello!</h1>,<br><h2><a href="http://localhost:8080/verify/register/${token}">please click here to verificate your registeration.</a></h2></b>` // html body
                        });

                        return true;
                    }
                }
            }
        })
    }

    function resetpass(email, newpass, oldpass, res) {
        console.log('asddddddd')
        connection.query(`SELECT * FROM register WHERE email = '${email}'`, function (err, rows, fields) {
            if (err) {
                console.error(err)
            } else {
                if (!rows[0]) {
                    res.send('No account with that email, please check it again')
                } else {
                    console.log('asd')
                    if (rows[0].password == hash(oldpass, rows[0].salt).passwordHash) {
                        console.log(email)
                        console.log('asdasddasasdasd')
                        console.log(rows[0].password)
                        console.log(newpass)
                        console.log(hash(oldpass, rows[0].salt).passwordHash)
                        console.log(hash(newpass, rows[0].salt).passwordHash)
                        let info = {};
                        info.user = email;
                        console.log(oldpass)
                        console.log(newpass)
                        console.log(rows[0].salt)
                        info.newpass = hash(newpass, rows[0].salt).passwordHash
                        info.salt = rows[0].salt
                        let now = moment();
                        info.expiry = new Date(now.add(30, 'm'))
                        let token = jwt.encode(info, conf.secret);
                        console.log(info)
                        console.log("http://localhost:8080/verify/resetpass/" + token);


                        transporter.sendMail({
                            from: '"LiranB work" <LiranForweb@gmail.com>', // sender address
                            to: email, // list of receivers
                            subject: "Your password has reseted!", // Subject line
                            text: "Hello world?", // plain text body
                            html: `<b><h1>Hello!</h1>,<br><h2><a href="http://localhost:8080/verify/resetpass/${token}">please click here to change your password.</a></h2></b>` // html body
                        });
                        console.log('Password changed!')
                        return true;
                    }
                }
            }
        })
    }

    // ========================================================

    app.get('/resend/verify', (req, res) => {
        res.render('handle.html', {
            statefor: "signup"
        })
    })

    app.get('/resend/verify/:email', (req, res) => {
        res.send('<h2>You may close the window now</h2>')
        let email = req.params.email
        verificate(email, res)
        // res.send('<h2>You may close the window now</h2>')
    })

    app.get('/verify/register/:token', (req, res, next) => {
        let token = req.params.token;
        let data = jwt.decode(token, conf.secret);
        if (new Date(data.expiry) < new Date()) {
            res.send(`<h2>This link expired already, would you like a resend?</h2><br><p><a href='http://localhost:8080/resend/verify/${data.user}'>Click here for a resend</p>`)
        } else {
            connection.query(`SELECT * FROM register WHERE email = '${data.user}'`, function (err, rows, fields) {
                if (err) {
                    console.error(err);
                } else {
                    if (!rows[0]) {
                        res.send(`<h2>There might be an error, this user doesn't exist.</h2><br><p><a href='http://localhost:8080/'>Click here to signup a new account.</p>`)
                    } else {
                        connection.query(`UPDATE register SET verified=1 WHERE email = '${data.user}' `, function (err, rows, fields) {
                            if (err) {
                                console.error(err)
                            } else {
                                console.log(rows)
                                res.redirect('/')
                            }
                        })
                    }
                }
            })
        }


    });

    app.get('/verify/resetpass/:token', (req, res, next) => {
        let token = req.params.token;
        let data = jwt.decode(token, conf.secret);
        console.log(data)
        if (new Date(data.expiry) < new Date()) {
            res.send(`<h2>This link expired already, would you like a resend?</h2><br><p><a href='http://localhost:8080/reset/password/'>Click here for a resend</p>`)
        } else {
            console.log(hash(data.newpass, data.salt).passwordHash)
            let query = `UPDATE register SET password='${data.newpass}' WHERE email = '${data.user}'`
            connection.query(query, (err, rows, fields) => {
                if (err) {
                    res.send('<h2>Password didn\'t got updated!</h2>')
                    console.error(err)
                } else {
                    res.send('<h2>You may close the window now</h2>')
                }
            })
        }

    });

    app.get('/reset/password', (req, res) => {
        res.render('handle.html', {
            statefor: "resetpass"
        })
    })

    app.get('/reset/password/:email/:newpass/:oldpass', (req, res) => {
        let email = req.params.email
        let newpass = req.params.newpass
        let oldpass = req.params.oldpass
        console.log(email)
        console.log(newpass)
        console.log(oldpass)

        resetpass(email, newpass, oldpass, res)
        // console.log('ads')
        res.send('<h2>You may close the window now</h2>')
    })

    // ========================================================

    app.get('/', (req, res) => {
        res.render('index.html')
    })



    app.post('/signup', (req, res, next) => {
        console.log(req.body)
        // connection.query('SELECT * FROM register WHERE email EQUALS ' + req.body.email)
        // console.log(`INSERT INTO register(email, password) VALUES (${req.body.email}, ${req.body.password})`) //'INSERT INTO register(email, password) VALUES (' + req.body.email + ', ' + req.body.password + ')'
        let email = req.body.email;
        let password_nothashed = req.body.password
        // ============ password encryption and those other things
        let salt = createsalt(16)
        let password_hashed = hash(password_nothashed, salt).passwordHash
        // console.log(salt, hash(password_nothashed, salt).salt) // just for debugging 
        // ============

        connection.query(`SELECT email FROM register WHERE email = '${email}'`, function (err, rows, fields) {
            if (err) {
                console.error(err);
            } else {
                if (rows[0]) {
                    console.log(rows)
                } else {
                    connection.query(`INSERT INTO register(email, password, salt, verified) VALUES ('${req.body.email}', '${password_hashed}', '${salt}', 'false')`, function (err, rows, fields) {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log("/signup, query succeed")
                        }

                        verificate(req.body.email);

                    })
                }
            }


        })

        res.redirect("/")

    })



    app.post('/login', (req, res, next) => {
        // console.log(req.body)
        let email = req.body.email;
        let inputpassword_nothashed = req.body.password;


        // checks ===== 1: does the email got that password? 2: is the account verified?
        // 
        connection.query(`SELECT * FROM register WHERE email = '${email}'`, (err, rows, fields) => {
            if (err) {
                console.error(err)
            } else {
                if (rows[0]) { //if its exists
                    // console.log(rows[0].id) // debugging
                    console.log(hash(inputpassword_nothashed, rows[0].salt))
                    connection.query(`SELECT email FROM register WHERE password = '${hash(inputpassword_nothashed, rows[0].salt).passwordHash}'`, (err, rowsa, fields) => { //check1
                        if (err) {
                            console.error(err)
                        } else {
                            // console.log(rowsa)
                            if (!rowsa[0]) {
                                res.redirect("/")
                            } else if (rowsa[0].email == req.body.email) {
                                console.log(rowsa)
                                // console.log('check1 succeed')
                                if (rows[0].password == hash(inputpassword_nothashed, rows[0].salt).passwordHash) {
                                    connection.query(`SELECT verified FROM register WHERE email = '${email}'`, (err, rowsb, fields) => { //check2
                                        if (err) {
                                            console.error(err)
                                        } else {
                                            if (rows[0].verified == 0) {
                                                res.redirect("/")
                                            } else if (rows[0].verified == 1) {
                                                // console.log('YES!!')
                                                // res.redirect("/profile")
                                                console.log(req.body.email)
                                                let body = {};

                                                body.email = req.body.email
                                                body.passwo = hash(inputpassword_nothashed, rows[0].salt).passwordHash
                                                let token = jwt.encode(body, conf.secret)  

                                                // request.get('http://localhost:8080/profile/callback/' + token)

                                                res.redirect('http://localhost:8080/profile/callback/' + token)

                                                // fetch('http://localhost:8080/profile', {
                                                //         method: 'post',
                                                //         body:    JSON.stringify(body)//,
                                                //         // headers: { 'Content-Type': 'application/json' },
                                                //     }).catch(a => {
                                                //         console.log(a)
                                                //     })
                                                //     .then(res => res.json())
                                                //     .then(json => console.log(json));
                                            }
                                        }
                                    })
                                } else {
                                    res.redirect("/")
                                }
                            }
                        }
                    })
                } else { //if it doesnt exist
                    res.redirect("/")
                }
            }

        })




        // res.render('index.html')
        // res.redirect("/")
    })

    // app.post()

    // app.get('/success', (req, res) => {
    //     res.send("Welcome " + req.query.username + "!!")
    // });

    // app.get('/error', (req, res) => {
    //     res.send("error logging in")
    // });

    // passport.serializeUser(function (user, cb) {
    //     cb(null, user.id);
    // });

    // passport.deserializeUser(function (id, cb) {
    //     User.findById(id, function (err, user) {
    //         cb(err, user);
    //     });
    // });
}