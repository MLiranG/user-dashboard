module.exports = function (app, passport, cookies, connection, crypto, transporter, conf, jwt, moment, fetch, request) {
    app.post('/profile/f', (req, res) => {
        console.log(req.body)
        let user = req.body.email
        let passw = req.body.password
        console.log(user + " " + passw)
        let query = `SELECT password FROM register WHERE email = '${user}'`
        connection.query(query, (err, rows, fields) => {
            if (err) {
                console.error(err)
            } else {
                console.log(rows[0].password)
                let info = {}
                info.user = user
                info.pass = passw
                let token = jwt.encode(info, conf.secret);
                // request.get(`http://localhost:8080/profile/callback/${token}`)
                res.render('mainpage.html')
            }

        })
        // res.render('mainpage.html')
    })

    app.get('/profile/callback/:token', (req, res, next) => {
        console.log('asdsadsdaasdasddasasd')
        let token = req.params.token;
        let data = jwt.decode(token, conf.secret);
        console.log(data)
        // res.render('mainpage.html')
        // next()
        res.redirect(`http://localhost:8080/profile`)
    })

    app.get('/profile', (req, res) => {
        console.log("1")
        res.send('<h2>idk</h2>')
    })
}