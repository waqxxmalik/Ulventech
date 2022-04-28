var mongoose = require("mongoose");
var passportLocalStrategy = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
 
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  
});


UserSchema.plugin(passportLocalStrategy)
const User = mongoose.model('user', UserSchema);

module.exports = User;