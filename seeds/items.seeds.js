require ('../db')

//create ToDo items to add to our collection
const myItems = [
{title: 'Pizza', description:'add a bunch of pineapple', price: '300'},
{title: 'Basketball', description:"Hope it doesn't blowup", price: '500'},
{title: 'Car', description:'Hope for the best', price: '700'},
{title: 'Pizza2', description:'add a bunch of pineapple2', price: '300'},
{title: 'Basketball2', description:"Hope it doesn't blowup2", price: '500'},
{title: 'Car2', description:'Hope for the best2', price: '700'},
{title: 'Pizza3', description:'add a bunch of pineapple3', price: '300'},
{title: 'Basketball3', description:"Hope it doesn't blowup3", price: '500'},
{title: 'Car3', description:'Hope for the best3', price: '700'},
]

const mongoose = require('mongoose')
//Insert ToDo items to the DB
const Items = require('../models/Items.model.js')

Items.create(myItems)
.then(()=> mongoose.connection.close(), console.log('yay'))
.catch(()=> console.log('nope'))
