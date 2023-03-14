const express = require('express')

const authF = require('../security/auth.js')

let router = express.Router()
let database = null;

router.post('/login-user', (req, res) => {
  console.log(req)
})

router.post('/login-admin', (req, res, next) => {
  authF(database).authenticate('admin_local', (err, user, info) => {
    if (err)
      return next(err)

    if (!user) {
      req.session.error = info.msg
      req.session._username = req.body.username
      req.session._password = req.body.password
      res.redirect('/admin_Iogin_4365')
      return;
    }

    req.login(user, err => {
      if (err)
        return next(err);
      res.redirect('/admin')
    })
  })(req, res, next)
})


module.exports = function(db) {
  database = db;
  return router;
}