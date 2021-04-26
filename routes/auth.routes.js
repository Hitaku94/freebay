const router = require("express").Router()
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.model')
const ItemsModel = require('../models/Items.model')
const MsgModel = require('../models/Message.model');


// Think about it!
/*router.use((req, res, next) => {
  req.app.locals.isUserLoggedIn = !!req.session.userInfo
})*/

const validate = (req, res, next) => {
  if (req.session.userInfo) {
   
    next()
  }
  else {
    res.redirect('/login')
  }
}

// Auth ROUTES

  /* Sign up */

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
    .then((result) => {
      req.session.userInfo = result
      res.redirect('/')
    }).catch((err) => {
      next(err)
    });

})

    /* Login */

router.get('/login', (req, res, next) => {
  res.render('auth/login.hbs')
})

router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  UserModel.findOne({ username })
    .then((result) => {
      if (!result) {
        res.render('auth/login.hbs', { msg: "Username or password does not match" })
      }
      else {
        bcrypt.compare(password, result.password)
          .then((passResult) => {
            if (passResult) {
              req.session.userInfo = result
              req.app.locals.isUserLoggedIn = true
              res.redirect('/')
            }
            else {
              res.render('auth/login.hbs', { msg: "Username or password does not match" })
            }
          })
      }
    })
    .catch((err) => {
      next(err)
    });
})

/* Logout */

router.get('/logout', (req, res, next) => {
  req.app.locals.isUserLoggedIn = false
  req.session.destroy()
  res.redirect('/')
})

router.get('/deactivate', validate, (req,res,next)=>{
    let userId = req.session.userInfo._id    
    ItemsModel.find()
    .populate('seller')
    .then((result) => {
      for(let i=0;i<result.length;i++){
        if(result[i].seller._id.toString() === userId.toString()){
          ItemsModel.findByIdAndDelete(result[i]._id)
          .then((result)=> {
            req.session.destroy()
            return UserModel.findByIdAndDelete(userId)
          })
          .then((result) => {
            req.app.locals.isUserLoggedIn = false  
            res.redirect('/');
          })
          .catch((err)=> next(err))
        }
      }
    })
    .catch ((err)=> next(err))
})

router.get('/settings', validate, (req,res,next)=>{
  res.render('settings.hbs');
})


router.post('/settings', validate, (req, res, next) => {
  let { newuser, newemail, newpassword } = req.body
  if(newuser ==''){
    console.log('fuckthis')
    newuser = req.session.userInfo.username
  }
  
  if(newemail == ''){
    console.log('fuckthistoo')
     newemail = req.session.userInfo.email
  }
  
  if(newpassword == ''){
    console.log('fuckthistohellandback')
    newpassword = req.session.userInfo.password
  }
  else{
    const passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    if (!passRe.test(newpassword)) {
      res.render('settings.hbs', { msg: 'Password must be 8 characters, must have a number, and an uppercase letter' })
      //tell node to come out of the callback code
      return;
    }
        
  }
  
  
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(newpassword, salt);
  newpassword = hash

  UserModel.findByIdAndUpdate(req.session.userInfo._id,{ username: newuser, email : newemail, password: newpassword},{new: true})
    .then((result) => {
      req.session.destroy()
      res.redirect('/')
    }).catch((err) => {
      next(err)
    });

})

// Other routes

/* GET home page */

router.get("/", (req, res, next) => {
  ItemsModel.find()
  .populate('seller')
  .then((result) => {
    res.render('index', { result })

  }).catch((err) => {
    next(err)
  });
})

router.post('/=?', (req, res, next)=>{
  const { title, category } = req.body
  
  const queryObj = {}
  if (title) queryObj.title = title // add name query to query obj only if user input a search
  if (category) queryObj.category = category // add category query to query obj if user selected a category
  
  // for example. if user does not select category then obj will be  {category: "a category"}
  
  ItemsModel.find(queryObj)
  .then((result) => {
    res.render('index.hbs', {result})
  }).catch((err) => {
      next(err)
  });
  
  })

/*ITEMS*/
router.get('/items', validate, (req, res, next) => {
  req.app.locals.ownerIsVisitor = false;
  ItemsModel.find()
   .populate('seller')
    .then((result) => {
      res.render('items-list.hbs', { result })

    }).catch((err) => {
      next(err)
    });
})

router.get('/items/create', validate, (req,res,next)=>{
  
  res.render('item-create-form.hbs')
})

router.post('/items/create', validate, (req,res,next)=>{
  const {title, category, condition, description, img, price} = req.body
  
  let seller = req.session.userInfo._id
  if (!title || !description || !price) {
    res.render('item-create-form.hbs', { msg: "Please enter all field" })
    return;
  }
  ItemsModel.create({ title, category, condition, description, img, price, seller })
    .then((result) => {
      res.redirect('/items')
    })
    .catch((err) => {
    
      next(err)
});
});

 

router.get('/items/:itemId',validate, (req,res,next)=>{
  req.app.locals.ownerIsVisitor = false;
  const {itemId} = req.params
  let visitor = req.session.userInfo._id
  ItemsModel.findById(itemId)
  .populate('seller')
  .then((result) => {
    let sellerId = result.seller._id.toString()
    if( visitor === sellerId){ 
      req.app.locals.ownerIsVisitor = true;
    }
    
    res.render('item-details.hbs', {result})
    
  }).catch((err) => {
    next(err)
  });

  


})

router.get('/items/:itemId/update', validate, (req,res,next)=>{
  req.app.locals.ownerIsVisitor = false;
  const {itemId} = req.params
  
  ItemsModel.findById(itemId)
  .then((result) => {
    res.render('item-edit-form.hbs', {result})
  }).catch((err) => {
    next(err)
  })
})

  router.post('/items/:itemId/update', validate, (req,res,next)=>{
    const {itemId} = req.params 
    const {title, category, condition, description, price} = req.body;
    
    ItemsModel.findByIdAndUpdate(itemId, {title, description, category, condition, price})
    .then((result)=>{
        res.redirect(`/profile`)
    })
    .catch((err) => {
      next(err)
    })
  })
     
  router.post('/items/:itemId/delete', validate, (req, res, next)=>{
    req.app.locals.ownerIsVisitor = false;
      const {itemId} = req.params
      ItemsModel.findByIdAndDelete(itemId)
      .then((result) => {
        res.redirect('/profile')
      })
      .catch((err)=>next(err))
  })

  router.get('/profile', validate, (req,res,next)=>{
      const {username} = req.session.userInfo;
      res.render('profile.hbs', {username});
  })

  router.post('/deactivate', validate, (req,res,next)=>{
    const {username} = req.session.userInfo;
    res.render('profile.hbs', {username});
})

module.exports = router;

