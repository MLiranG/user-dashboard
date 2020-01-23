module.exports = function (app, passport, cookies, connection, crypto, transporter, conf, jwt, moment, fetch, request, path, fs, multer) {

    const handleError = (err, res) => {
        res
            .status(500)
            .contentType("text/plain")
            .end("Oops! Something went wrong!");
    };

    function uniqueid() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ Math.random(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
      }

    app.get('/profile/callback/:token', (req, res, next) => {
        console.log('asdsadsdaasdasddasasd')
        let token = req.params.token;
        let data = jwt.decode(token, conf.secret);
        console.log(data)
        console.log(req.session)

        let tokena = jwt.encode(data, conf.secret);

        req.session.data = tokena

        // console.log(req.session.data)

        // res.render('mainpage.html')
        // next()
        res.redirect(`http://localhost:8080/profile`)
        // res.send('<h2>idk</h2>')
    })

    app.get('/profile', (req, res) => {
        if (req.session.data) {
            let data = jwt.decode(req.session.data, conf.secret);
            console.log("asddasdasadssda \n")
            console.log(data)
            res.render('mainpage.html', {
                data: data
            })
        } else {
            res.redirect(`http://localhost:8080/`)
        }
    })

    app.put('/profile/uploadpic', (req, res) => {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400) //.send('No files were uploaded.');
        } else {

            // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
            let put_name = req.files.file;
            console.log(put_name)
            let name = uniqueid()
            put_name.mv('./api/files/uploads/' + name)
            res.send('./api/files/uploads/' + name)

            connection.query(`UPDATE userinfo SET profilepic='${name}' WHERE email = "bargigi78@gmail.com"`, (err, rows, fields) => {
                if (err) {
                    console.error(err)
                }
            })
        }
    })

    app.get('/profile/pictures/findpic/:email', (req, res) => {
        connection.query(`SELECT profilepic FROM userinfo WHERE email='${req.params.email}'`, (err, rows, fields) => {
            if (err) {
                console.error(err);
            } else {
                if (rows[0]) {
                    res.send(rows[0])
                } else {
                    res.send("nopic")
                }
            }
        })
    })



}