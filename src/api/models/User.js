const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const validator  = require('validator')

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, trim: true, required: true },
    userSurname: { type: String, trim: true, required: true },
    email: {
      type: String,
      trim: true,
      required: true,
      validate: [validator.isEmail, 'Email is not valid'],
    },
    password: {
      type: String,
      trim: true,
      required: true,
     /* minlength: [8, 'Password 8 characters minimum'],*/
    },
    favorites: { type: [String], trim: true, required: true },
    rol: { type: String, required: true, /*default: "user",*/ enum: ["admin", "user"]}
  }, {
    timestamps: true,
    collection: "Users",
  });


//re-encripta la contraseña sólo si esta ha cambiado
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
  } catch (error) {
      next(error);
  }
});

const User = mongoose.model('Users', userSchema, 'Users')

module.exports = User


/*
const isValidEmail = validator.isEmail('example@example.com');
console.log(isValidEmail); */

