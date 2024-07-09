const jwt = require('jsonwebtoken');
const jwtconfig = require('./../config/jwt.config.js');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).send({ auth: false, message: 'No se proporcionó un token.' });
  }

  jwt.verify(token, jwtconfig.secretKey, (err, decoded) => {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Falló la autenticación del token.' });
    }
    next();
  });
};

module.exports = verificarToken;
