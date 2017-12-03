// This is the db model that would describe what information is stored.

var mongoose = require('mongoose');

// bcrypt is the password hashing function that is now required.
var bcrypt = require('bcrypt-nodejs');

// This is the user mongoose schema.
var userSchema = new mongoose.Schema({
  local: {
    username: String,
    password: String
  }
});

userSchema.methods.generateHash = function(password) {
  // Create salted hash of plaintext password
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

userSchema.methods.validPassword = function(password) {
  // Compare password to stored password
  return bcrypt.compareSync(password, this.local.password);
}

var User = mongoose.model('User', userSchema);

module.exports = User;
