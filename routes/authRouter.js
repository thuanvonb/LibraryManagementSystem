const express = require('express')

const auth = require('../security/auth.js')
const registration = require('../security/registration.js')
const database = require('./../database/db.js')

let router = express.Router()

router.post('/login-user', (req, res, next) => {
  auth.authenticate('user_local', (err, user, info) => {
    if (err)
      return next(err)

    if (!user) {
      req.session.error = info.msg
      req.session._username = req.body.username
      req.session._password = req.body.password
      res.redirect('/login')
      return;
    }

    req.login(user, err => {
      if (err)
        return next(err);
      res.redirect('/')
    })
  })(req, res, next)
})

router.post('/login-admin', (req, res, next) => {
  auth.authenticate('admin_local', (err, user, info) => {
    if (err)
      return next(err)

    if (!user) {
      req.session.error = info.msg
      req.session._username = req.body.username
      req.session._password = req.body.password
      res.redirect('/admin_login_4365')
      return;
    }

    req.login(user, err => {
      if (err)
        return next(err);
      res.redirect('/admin')
    })
  })(req, res, next)
})

router.post('/register', (req, res, next) => {
  let [user, pwd] = registration.userRegistration(req.body)
  console.log(user)
  database.insert('WebUser', user).then(msg => {
    console.log(msg)
    res.redirect('/login')
  }, err => {
    console.log(err)
    res.redirect('/registration')
  })
})


module.exports = router;