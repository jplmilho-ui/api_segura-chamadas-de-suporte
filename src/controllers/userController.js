const prisma = require('../lib/prisma');

const ROLES_VALIDOS = ['USER', 'ADMIN'];

// GET /users (apenas ADMIN)
async function listar(req, res, next) {
  try {
    const usuarios = await prisma.user.findMany({
      omit: {
        password: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return res.status(200).json(usuarios);
  } catch (erro) {
    return next(erro);
  }
}

// PATCH /users/:id/role (apenas ADMIN)
async function alterarRole(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID de usuário inválido.' });
    }

    const { role } = req.body;
    if (!role || !ROLES_VALIDOS.includes(String(role).toUpperCase())) {
      return res.status(400).json({
        erro: 'Role inválido. Use USER ou ADMIN.',
      });
    }

    const usuarioExistente = await prisma.user.findUnique({
      where: { id },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: {
        role: String(role).toUpperCase(),
      },
      omit: {
        password: true,
      },
    });

    return res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      usuario: usuarioAtualizado,
    });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  listar,
  alterarRole,
};
