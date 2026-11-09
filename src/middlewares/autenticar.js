const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      erro: 'Token não informado.',
    });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
    return res.status(401).json({
      erro: 'Formato de token inválido. Use: Bearer <token>',
    });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = {
      id: Number(payload.sub),
      role: payload.role,
    };

    return next();
  } catch (erro) {
    return res.status(401).json({
      erro: 'Token inválido ou expirado.',
    });
  }
}

module.exports = autenticar;
