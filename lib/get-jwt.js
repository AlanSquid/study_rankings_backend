const jwt = require('jsonwebtoken');

const getJWT = {
  accessJwtSign: (user) => {
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

  refreshJwtSign: (user) => {
    const refreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        comparisonCount: user?.comparisonCount || 0
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return refreshToken;
  }
};

module.exports = getJWT;
