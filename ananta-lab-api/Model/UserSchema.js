const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'Please provide credentials'],
      minLength: 5,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide credentials'],
    },
    secretKey: String,
    is2FAEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this.userId, is2FAEnabled: this.is2FAEnabled },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};
UserSchema.methods.comparePassword = async function (candidatepass) {
  const isMatch = await bcrypt.compare(candidatepass, this.password);
  return isMatch;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
