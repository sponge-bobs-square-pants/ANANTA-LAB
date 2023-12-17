const express = require('express');
const connectDB = require('./DB/ConnectDB');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const EventEmitter = require('events');
const User = require('./Model/UserSchema');
// ROUTES
const user = require('./Routes/User');
//AUTHTNTICATION
const bodyParser = require('body-parser');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { authenticator } = require('otplib');
//STATUSCODES
const { StatusCodes } = require('http-status-codes');
const UserAuthMiddleware = require('./Middleware/UserAuthMiddleware');
//
const app = express();

app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(express.json());

EventEmitter.defaultMaxListeners = 15;

app.use('/api/v1', user);
app.get('/api/v1/generate-otp-secret', UserAuthMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findOne({ userId });
    if (!user.secretKey) {
      const secret = speakeasy.generateSecret({
        name: `MYauth/${userId}`,
      });
      console.log(secret);

      await User.findOneAndUpdate(
        { userId },
        { $set: { secretKey: secret.base32 } },
        { new: true }
      );
      console.log(user);
      QRCode.toDataURL(secret.otpauth_url, (err, data) => {
        if (err) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ msg: 'Something went wrong.Please try again later' });
        }
        res.status(StatusCodes.OK).json({
          secret: user.secretKey,
          image: data,
        });
      });
    } else {
      const is2FAEnabled = req.user.is2FAEnabled;
      if (!is2FAEnabled) {
        const dataUrl = await QRCode.toDataURL(
          `otpauth://totp/Parth?secret=${user.secretKey}`
        );
        console.log(user, 'This is user');
        res.status(StatusCodes.OK).json({
          secret: user.secretKey,
          image: dataUrl,
        });
      } else {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ msg: '2FA is already setup' });
      }
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Internal Server Error' });
  }
});
app.post('/api/v1/confirm-otp-secret', UserAuthMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const token = req.body.token;
  try {
    const user = await User.find({ userId });
    const secretKey = user[0].secretKey;
    const verified = speakeasy.totp.verify({
      secret: `${secretKey}`,
      encoding: 'base32',
      token: `${token}`,
    });
    console.log(verified);
    if (!verified) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: 'Please enter the correct OTP' });
    }
    if (verified) {
      console.log(verified);
      const user = await User.findOneAndUpdate(
        { userId },
        { $set: { is2FAEnabled: true } },
        { new: true }
      );
      const token = user.createJWT();
      return res
        .status(StatusCodes.OK)
        .json({ userId: user.userId, is2FAEnabled: user.is2FAEnabled, token });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Something went wrong' });
  }
});
app.get('/api/v1/deactivate2FA', UserAuthMiddleware, async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findOneAndUpdate(
      { userId },
      { $set: { is2FAEnabled: false, secretKey: '' } },
      { new: true }
    );
    if (user) {
      const token = user.createJWT();
      res
        .status(201)
        .json({ userId: user.userId, is2FAEnabled: user.is2FAEnabled, token });
    }
  } catch (error) {
    res.status(500).json({ msg: 'INTERNAL SERVER ERROR' });
  }
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};
start();
