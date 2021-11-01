const express = require('express'),
    mysql = require('mysql'),
    passport = require('passport'),
    flash = require('express-flash'),
    session = require('express-session'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    initializePassport = require(__dirname + '/passport-config.js')

var app = express()

app.set('view engine', 'ejs')
app.set('views', [path.join(__dirname, '/views'),
    path.join(__dirname, 'views/details')
])

var port = process.env.SERVER_PORT,
    server = app.listen(process.env.SERVER_PORT, function() {
        console.log(' Server runining on port ' + port)
        console.log(' url: http://localhost:' + port)
    }),
    con = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    }),
    main_controller = require(__dirname + '/config/main-controller.js'),
    websocket = require(__dirname + '/websocket.js')

initializePassport(passport, con)

//Static Files
app.use(express.static(path.join(__dirname, '/public')))
app.use('/chartjs', express.static(__dirname + '/node_modules/chart.js/dist/Chart.min.js'))
app.use('/public', express.static(__dirname + '/public'))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())

main_controller(app, con, path, passport)
websocket(server, con)