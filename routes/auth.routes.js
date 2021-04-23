const router = require("express").Router()
const bcrypt = require('bcryptjs');
const User = require("../models/User.model.js");
const UserModel = require('../models/User.model.js')

router.get('/signup', (req, res, next) => {
  res.render('auth/signup.hbs')
})

router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    res.render('auth/signup.hbs', { msg: "Please enter all field" })
    return;
  }

  const passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
  if (!passRe.test(password)) {
    res.render('auth/signup.hbs', { msg: 'Password must be 8 characters, must have a number, and an uppercase letter' })
    //tell node to come out of the callback code
    return;
  }

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(password, salt);

  UserModel.create({ username, email, password: hash })
    .then(() => {
      res.redirect('/')
    }).catch((err) => {
      next(err)
    });

})

router.get('/login', (req, res, next) => {
  res.render('auth/login.hbs')
})

router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  UserModel.findOne({username})
  .then((result) => {
    if(!result) {
      res.render('auth/login.hbs', {msg: "Username or password does not match"})
    }
    else {
      bcrypt.compare(password, result.password)
      .then((passResult) => {
        if(passResult) {
          req.session.userInfo = result
          req.app.locals.isUserLoggedIn = true
          res.redirect('/')
        }
        else {
          res.render('auth/login.hbs', {msg: "Username or password does not match"})
        }
      })
    }
  })
  .catch((err) => {
    next(err)
  });
})


module.exports = router;