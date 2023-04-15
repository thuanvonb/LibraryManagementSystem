const express = require('express')

let router = express.Router()

router.get('/admin', (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect('/login')
    return;
  }
  res.render('pages/services/admin', {
    permission: req.user.permission,
    who: req.user.sName
  })
})


module.exports = router