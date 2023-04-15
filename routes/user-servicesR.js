const express = require('express')

let router = express.Router()

router.get('/', (req, res) => {
  if (!req.isAuthenticated())
    return res.redirect('/login')
  if (req.isAdmin)
    return res.redirect('/admin')
  res.send(`Hello ${res.name}! This place is under-development.`)
})

module.exports = router