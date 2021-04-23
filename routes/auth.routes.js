const router = require("express").Router()
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')
const ItemsModel = require('../models/Items.model')
const MsgModel = require('../models/Message.model')

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



/*ITEMS*/
router.get('/items', /*validate,*/ (req,res,next)=>{
    
  ItemsModel.find()
    .then((result) => {
      res.render('items-list.hbs', {result})
      
    }).catch((err) => {
        next(err)
    });
})

router.get('/items/create', /*validate,*/, (req,res,next)=>{
  res.render('/item-create.hbs')
})

router.post('items/create', /*validate,*/(req,res,next)=>{
  
});       

module.exports = router;