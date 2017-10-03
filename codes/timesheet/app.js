var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var helmet = require('helmet')

var index = require('./routes/index')
var timestamps = require('./routes/timestamps')

var authController = require('./controllers/auth')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(helmet())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)

// Protected Path
app.use('/timestamps', function (req, res, next) {
  if (req.headers.token) {
    authController.authorizeUser(req.headers.token).then(user => {
      if (user) {
        req.currentUser = user
        next()
      } else {
        res.status(400).send({
          message: 'Invalid token'
        })
      }
    }).catch(err => {
      res.status(500).send(err)
    })
  } else {
    res.status(401).send({
      message: 'Restricted path and you\'re unauthorized'
    })
  }
})
app.use('/timestamps', timestamps)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app