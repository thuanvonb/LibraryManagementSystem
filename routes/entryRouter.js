const express = require('express');

let router = express.Router();

// router.get('/registration', (req, res) => {
//   res.render('pages/entry/register')
// })

router.get('/login', (req, res) => {
  res.redirect('/admin_login_4365')
  // if (req.isAuthenticated()) {
  //   if (req.user.isAdmin)
  //     res.redirect('/admin')
  //   return
  // }
  // res.render('pages/entry/login', {
  //   data: {
  //     renderCode: 1, 
  //     title: "User login", 
  //     error: req.session.error,
  //     username: req.session._username,
  //     password: req.session._password
  //   }
  // })
  // req.session.error = undefined;
})

// router.get('/login2', (req, res) => {
//   res.render('pages/entry/login', {
//     data: {
//       renderCode: 0, 
//       title: "Login test", 
//       error: req.session.error,
//       username: req.session._username,
//       password: req.session._password
//     }
//   })
//   req.session.error = undefined;
// })

router.get('/admin_Iogin_4365', (req, res) => {
  res.redirect('/admin_login_4365')
})

router.get('/admin_login_4365', (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin)
      res.redirect('/admin')
    return
  }
  res.render('pages/entry/login', {
    data: {
      renderCode: 2, 
      title: "Staff login", 
      error: req.session.error,
      username: req.session._username,
      password: req.session._password
    }
  })
  req.session.error = undefined;
})

router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err)
      return next(err)
    res.redirect('/admin_login_4365')
  })
})

module.exports = router