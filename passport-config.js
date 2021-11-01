var localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

module.exports = function(passport, con) {
    //Passport credential Authentication
    passport.use(new localStrategy({
        usernameField: 'username',
        passwordField: 'password',
    }, function(username, password, done) {
        //Username and Password validation 
        con.query("SELECT * FROM `administrator` WHERE `username` = '" + username + "'", async function(err, rows) {
            if (err)
                return done(err)
            if (!rows.length) {
                return done(null, false, { message: 'Akun belum terdaftar!' })
            }
            try {
                if (await bcrypt.compare(password, rows[0].password)) {
                    return done(null, rows[0])
                } else {
                    return done(null, false, { message: 'Username dan Password tidak sesuai' })
                }
            } catch (error) {
                return done(error)
            }

        })
    }))

    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done) {
        con.query("SELECT * FROM administrator WHERE id = " + id, function(err, rows) {
            done(err, rows[0])
        })
    })
}