var bodyParser = require('body-parser'),
    bcrypt = require('bcryptjs'),
    methodOverride = require('method-override')

module.exports = function(app, con, path, passport) {
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(methodOverride('_method'))

    function checkAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        res.redirect('/login')
    }

    function cehckNotAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect('/')
        }
        next()
    }

    app.get('/', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = " + req.user.id

        con.query(query, function(err, result) {
            res.render('index', {
                biodata: result
            })
        })
    })

    app.get('/login', cehckNotAuthenticated, function(req, res) {
        res.render('login', {
            message: ''
        })
    })

    app.post('/login', cehckNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }))

    app.get('/logout', checkAuthenticated, function(req, res) {
        req.logOut(),
        res.redirect('/login')
    })

    app.get('/penjadwalan', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = '" + req.user.id + "';"
        query += "SELECT * FROM `jadwal_aktuator` WHERE jenis = 'pump';"
        query += "SELECT * FROM `jadwal_aktuator` WHERE jenis = 'growlight';"
        query += "SELECT * FROM `jadwal_aktuator_dua` WHERE jenis = 'pump';"
        query += "SELECT * FROM `aktuator`;"
        query += "SELECT * FROM `periode`;"

        con.query(query, function(err, result) {
            if (err) throw err
            res.render('penjadwalan', {
                biodata: result[0],
                pump_value: result[1],
                growlight_value: result[2],
                pump_periode : result[3],
                mode: result[4],
                periode: result[5]

            })
        })
    })

    app.post('/update_jadwal_pump', checkAuthenticated, function(req, res) {
        var query = "UPDATE jadwal_aktuator SET jadwal_pagi = '" + req.body.jam_pagi_pump + ":" + req.body.menit_pagi_pump + ":00',"
        query += " jadwal_sore = '" + req.body.jam_sore_pump + ":" + req.body.menit_sore_pump + ":00' WHERE jenis = 'pump';"

        con.query(query, function(err, result) {
            if (err) throw err
            res.redirect('/penjadwalan')
        })
    })

    app.post('/update_jadwal_growlight', checkAuthenticated, function(req, res) {
        var query = "UPDATE jadwal_aktuator SET jadwal_pagi = '" + req.body.jam_pagi_growlight + ":" + req.body.menit_pagi_growlight + ":00',"
        query += " jadwal_sore = '" + req.body.jam_sore_growlight + ":" + req.body.menit_sore_growlight + ":00' WHERE jenis = 'growlight';"

        con.query(query, function(err, result) {
            if (err) throw err
            res.redirect('/penjadwalan')
        })
    })

    app.post('/update_jadwal_periode_pagi', checkAuthenticated, function(req, res) {
        var query = "UPDATE jadwal_aktuator_dua SET jadwal_pagi1 = '" + req.body.jam_pagi_pump1 + ":" + req.body.menit_pagi_pump1 + ":00',"
        query += " jadwal_pagi2 = '" + req.body.jam_pagi_pump2 + ":" + req.body.menit_pagi_pump2 + ":00' WHERE jenis = 'pump';"

        con.query(query, function(err, result) {
            if (err) throw err
            res.redirect('/penjadwalan')
        })
    })

    app.post('/update_jadwal_periode_sore', checkAuthenticated, function(req, res) {
        var query = "UPDATE jadwal_aktuator_dua SET jadwal_sore1 = '" + req.body.jam_sore_pump1 + ":" + req.body.menit_sore_pump1 + ":00',"
        query += " jadwal_sore2 = '" + req.body.jam_sore_pump2 + ":" + req.body.menit_sore_pump2 + ":00' WHERE jenis = 'pump';"

        con.query(query, function(err, result) {
            if (err) throw err
            res.redirect('/penjadwalan')
        })
    })

    app.get('/profile', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = " + req.user.id

        con.query(query, function(err, result) {
            if (err) throw err
            res.render('profile', {
                biodata: result
            })
        })
    })

    app.post('/update_biodata', checkAuthenticated, function(req, res) {
        var query = "UPDATE administrator SET nama = '" + req.body.nama + "',"
        query += " email = '" + req.body.email + "',"
        query += " telepon = '" + req.body.telepon + "',"
        query += " alamat = '" + req.body.alamat + "' WHERE " + req.user.id + ";"

        con.query(query, function(err, result) {
            if (err) throw err
            res.redirect('/profile')
        })
    })

    app.get('/details-ruangan', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = '" + req.user.id + "';"
        query += "SELECT * FROM `data_temperature`;"
        query += "SELECT * FROM `data_humidity`;"

        con.query(query, function(err, result) {
            if (err) throw err
            res.render('details-ruangan', {
                biodata: result[0],
                temperature: result[1],
                humidity: result[2]
            })
        })
    })

    app.get('/details-pencahayaan', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = '" + req.user.id + "';"
        query += "SELECT * FROM `data_light`;"

        con.query(query, function(err, result) {
            if (err) throw err
            res.render('details-pencahayaan', {
                biodata: result[0],
                light: result[1]
            })
        })
    })

    app.get('/details-suhu-air', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = '" + req.user.id + "';"
        query += "SELECT * FROM `data_water`;"

        con.query(query, function(err, result) {
            if (err) throw err
            res.render('details-water', {
                biodata: result[0],
                water: result[1]
            })
        })
    })

    app.get('/details-ph', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = '" + req.user.id + "';"
        query += "SELECT * FROM `data_ph`;"

        con.query(query, function(err, result) {
            if (err) throw err
            res.render('details-ph', {
                biodata: result[0],
                ph: result[1]
            })
        })
    })

    app.get('details-ppm', checkAuthenticated, function(req, res) {
        var query = "SELECT * FROM `administrator` WHERE id = '" + req.user.id + "';"
        query += "SELECT * FROM `data_ppm`;"

        con.query(query, function(err, result) {
            if (err) throw err
            res.render('details-ppm', {
                biodata: result[0],
                ppm: result[1]
            })
        })
    })
}