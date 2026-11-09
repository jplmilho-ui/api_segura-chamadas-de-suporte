function autorizar(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }

    if (!perfisPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({
        erro: 'Acesso negado para o seu perfil.',
      });
    }

    return next();
  };
}

module.exports = autorizar;
