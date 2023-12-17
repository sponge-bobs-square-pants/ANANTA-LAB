const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const UserAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const { userId, is2FAEnabled } = decode;
    req.user = { userId, is2FAEnabled };
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
  }
};
module.exports = UserAuthMiddleware;
