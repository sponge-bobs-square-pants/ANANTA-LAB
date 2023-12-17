const { StatusCodes } = require('http-status-codes');
const User = require('../Model/UserSchema');

const LoginUser = async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: 'PLEASE PROVIDE ALL THE DETAILS' });
  }
  const user = await User.findOne({ userId });
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: 'Invalid Credentials' });
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: 'Invalid Credentials' });
  }
  const token = user.createJWT();
  return res
    .status(StatusCodes.OK)
    .json({ is2FAEnabled: user.is2FAEnabled, userId, token });
};
const CreateUser = async (req, res) => {
  const userId = req.body.userId;
  const exsistingUser = await User.findOne({ userId });
  if (exsistingUser) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: `User already present` });
  }
  try {
    const user = await User.create({ ...req.body });
    const token = await user.createJWT();
    return res
      .status(StatusCodes.CREATED)
      .json({ is2FAEnabled: user.is2FAEnabled, userId: user.userId, token });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errorMessage = Object.values(error.errors)
        .map((error) => error.message)
        .join(', ');

      return res.status(StatusCodes.BAD_REQUEST).json({ msg: errorMessage });
    }
  }
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .json({ msg: `User creation failed` });
};

module.exports = {
  LoginUser,
  CreateUser,
};
