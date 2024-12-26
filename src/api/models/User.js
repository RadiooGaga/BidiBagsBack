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
      minlength: [8, 'Password 8 characters minimum'],
    },
    favorites: { type: [String], trim: true, required: true },
    rol: { type: String, enum: ["admin", "user"],  default: "user" },

    // Nuevos campos para dirección y forma de pago
    shippingAddress: [ 
      {
      street: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
      }
    ],

    billingAddress: [
      {
        street2: { type: String },
        city2: { type: String },
        postalCode2: { type: String },
        country2: { type: String },
      }
    ],
    paymentMethods: [
      {
        paymentToken: { type: String }, 
        // Token de pago proporcionado por el proveedor de pago (por ej. Stripe)
        cardHolderName: { type: String },
      },
    ],
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

