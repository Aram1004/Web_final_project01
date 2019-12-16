const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Schema = mongoose.Schema;

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  description: {type: String, required: true},
  price: {type: Number},
  course: {type: String},
  picture: {type: String},

  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});


var Travel = mongoose.model('Travel', schema);

module.exports = Travel;
