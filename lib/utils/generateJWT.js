const jwt = require('jsonwebtoken');
const helper = require('./helper');

const generateJWT = {
  getAccessToken: async (user) => {
    const comparisonCount = await helper.getComparisonCount(user.id);
    if (comparisonCount > 0) user.comparisonCount = comparisonCount;

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        comparisonCount: user?.comparisonCount || 0
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: '15m'
      }
    );

    return accessToken;
  },

  getRefreshToken: (user) => {
    const refreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return refreshToken;
  }
};

module.exports = generateJWT;
