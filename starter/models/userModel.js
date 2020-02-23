const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'A user must have an email'],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
      type: String
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'admin', 'lead-guide'],
      default: 'user'
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: 8,
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'A user must have a passwordConfirm'],
      minlength: 8,
      validate: {
        validator: function(el) {
          return el === this.password; // custom Vlidator will work on create and save, not on update.
        },
        message: 'Passwords are not the same'
      }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// pre save middle ware to manipulate the pre saved data
userSchema.pre('save', async function(next) {
  // if password not modified then return
  if (!this.isModified('password')) return next();
  // if password modified then hash

  // hash the paSSWORD BEFORE inserting the user with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // remove the password comfirm as it is not required
  this.passwordConfirm = undefined;
  next();
});

// instance method
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changeTimeStamp, JWTTimestamp);
    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken });
  this.passwordResetExpire = Date.now + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
