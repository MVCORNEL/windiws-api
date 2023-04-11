const jwt = require('jsonwebtoken');

/**
 * Function that ceates and returns a JWT TOKEN, create using the header,payload and the secret.
 * @param {string} payload payload that will be encodend  into the TOKEN
 * @returns {string} JWT TOKEN
 *
 */
const createJWT = (payloadId) => {
  const JSON_TOKEN_SECRET = process.env.JSON_TOKEN_SECRET;
  const JSON_TOKEN_EXPIRING_TIME = process.env.JSON_TOKEN_EXPIRING_TIME;
  //Create jwt signature (Payload, Secret, Headers + Options )
  const token = jwt.sign({ id: payloadId }, JSON_TOKEN_SECRET, { expiresIn: JSON_TOKEN_EXPIRING_TIME });

  return token;
};

module.exports = createJWT;
