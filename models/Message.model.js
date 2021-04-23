const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const msgSchema = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item'
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [
    {
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },   
      message: {
        type: String,
        required: true,
      },
      timestamp: Date,
    },
  ],
});

const Msg = model("Msg", msgSchema);

module.exports = Msg;


