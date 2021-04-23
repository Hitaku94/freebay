const router = require("express").Router()
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')
const ItemsModel = require('../models/Items.model')
const MsgModel = require('../models/Message.model')

const validate = (req, res, next) => {
  if (req.session.userInfo) {
    next()
  }
  else {
    res.redirect('/login')
  }
}

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


/*ITEMS*/
router.get('/items', /*validate,*/ (req,res,next)=>{
    
  ItemsModel.find()
    .then((result) => {
      res.render('items-list.hbs', {result})
      
    }).catch((err) => {
        next(err)
    });
})

router.get('/items/create', /*validate,*/(req,res,next)=>{
  res.render('item-create-form.hbs')
})

router.post('/items/create', /*validate,*/(req,res,next)=>{
  const {title, condition, description, img, price, seller} = req.body
  if (!title || !description || !price) {
    res.render('item-create-form.hbs', { msg: "Please enter all field" })
    return;
  }
  ItemsModel.create({title, condition, description, img, price, seller})
    .then((result) => {
      res.redirect('/items',{result})
    }).catch((err) => {
        next(err)
    });
});       

router.get('/items/:itemId', /*validate,*/ (req,res,next)=>{
  const {itemId} = req.params
  ItemsModel.finbyId(itemId)
  .then((result) => {
    res.render('item-detail.hbs', {result})
  }).catch((err) => {
    next(err)
  });
})

router.get('/items/:itemId/update', /*validate,*/ (req,res,next)=>{
  const {itemId} = req.params
  ItemsModel.finbyId(itemId)
  .then((result) => {
    res.render('item-edit-form.hbs', {result})
  }).catch((err) => {
    next(err)
  })
})

  router.post('/items/:itemId/update', (req,res,next)=>{
    const {itemId} = req.params 
    const {title, description, category, condition, img, price} = req.body;
    
    ItemsModel.findByIdAndUpdate(itemId, {title, description, category, condition, img, price}, {new:true})
    .then((result)=>{
        res.redirect(`/items/${itemsId}`, {result})
    })
    .catch((err)=>{
        next(err)
    })
  })
     
  router.post('/items/:itemId/delete', (req, res, next)=>{
      const {itemId} = req.params
      ToDo.findByIdAndDelete(itemId)
      .then((result) => {
        res.render('profile.hbs', {result})
      })
      .catch((err)=>next(err))
  })






module.exports = router;