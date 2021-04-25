const { Schema, model } = require("mongoose");

require('../models/User.model')

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  category: [String],
  condition: [String],
    
  description: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    default: '/images/default-image.jpg',
  },
  price: {
    type: Number,
    required: true,
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Item = model("Item", itemSchema);

module.exports = Item;


