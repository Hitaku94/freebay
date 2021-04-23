const router = require("express").Router()
//const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model.js')

router.get('/signup', (req, res, next) => {
  res.render('auth/signup.hbs')
})

//router.post('/signup', (req, res, next))

router.get('/login', (req, res, next) => {
  res.render('auth/login.hbs')
})

module.exports = router;