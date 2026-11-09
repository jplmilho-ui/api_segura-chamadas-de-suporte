const prisma = require('../lib/prisma');

const STATUS_VALIDOS = ['ABERTO', 'EM_ANDAMENTO', 'FECHADO'];
const PRIORIDADES_VALIDAS = ['BAIXA', 'MEDIA', 'ALTA'];

// GET /chamados - USER vê apenas os seus; ADMIN vê todos
async function listar(req, res, next) {
  try {
    const filtro =
      req.usuario.role === 'ADMIN' ? {} : { usuarioId: req.usuario.id };

    const chamados = await prisma.chamado.findMany({
      where: filtro,
      include: {
        usuario: {
          omit: {
            password: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return res.status(200).json(chamados);
  } catch (erro) {
    return next(erro);
  }
}

// GET /chamados/:id
async function buscarPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const chamado = await prisma.chamado.findUnique({
      where: { id },
      include: {
        usuario: {
          omit: {
            password: true,
          },
        },
      },
    });

    if (!chamado) {
      return res.status(404).json({ erro: 'Chamado de suporte não encontrado.' });
    }

    if (chamado.usuarioId !== req.usuario.id && req.usuario.role !== 'ADMIN') {
      return res.status(403).json({
        erro: 'Acesso negado: você só pode visualizar seus próprios chamados.',
      });
    }

    return res.status(200).json(chamado);
  } catch (erro) {
    return next(erro);
  }
}

// POST /chamados - o dono vem sempre do token (req.usuario.id)
async function criar(req, res, next) {
  try {
    const { titulo, problema, prioridade } = req.body;

    if (!titulo || !problema) {
      return res.status(400).json({
        erro: 'Os campos titulo e problema são obrigatórios.',
      });
    }

    const prioridadeEscolhida = prioridade ? String(prioridade).toUpperCase() : 'MEDIA';
    if (!PRIORIDADES_VALIDAS.includes(prioridadeEscolhida)) {
      return res.status(400).json({
        erro: 'Prioridade inválida. Use BAIXA, MEDIA ou ALTA.',
      });
    }

    const novoChamado = await prisma.chamado.create({
      data: {
        titulo: String(titulo).trim(),
        problema: String(problema).trim(),
        prioridade: prioridadeEscolhida,
        status: 'ABERTO',
        usuarioId: req.usuario.id,
      },
      include: {
        usuario: {
          omit: {
            password: true,
          },
        },
      },
    });

    return res.status(201).json(novoChamado);
  } catch (erro) {
    return next(erro);
  }
}

// PUT /chamados/:id - checa 404 antes de 403
async function atualizar(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const chamadoExistente = await prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamadoExistente) {
      return res.status(404).json({
        erro: 'Chamado de suporte não encontrado.',
      });
    }

    const ehDono = chamadoExistente.usuarioId === req.usuario.id;
    const ehAdmin = req.usuario.role === 'ADMIN';

    if (!ehDono && !ehAdmin) {
      return res.status(403).json({
        erro: 'Acesso negado: você não tem permissão para alterar o chamado de outro usuário.',
      });
    }

    const { titulo, problema, prioridade, status, respostaTecnica } = req.body;
    const dadosAtualizacao = {};

    if (titulo !== undefined) dadosAtualizacao.titulo = String(titulo).trim();
    if (problema !== undefined) dadosAtualizacao.problema = String(problema).trim();

    if (prioridade !== undefined) {
      const prioUpper = String(prioridade).toUpperCase();
      if (!PRIORIDADES_VALIDAS.includes(prioUpper)) {
        return res.status(400).json({ erro: 'Prioridade inválida.' });
      }
      dadosAtualizacao.prioridade = prioUpper;
    }

    if (status !== undefined) {
      const statusUpper = String(status).toUpperCase();
      if (!STATUS_VALIDOS.includes(statusUpper)) {
        return res.status(400).json({ erro: 'Status inválido.' });
      }
      if (!ehAdmin && statusUpper !== chamadoExistente.status) {
        return res.status(403).json({
          erro: 'Apenas ADMIN pode alterar o status ou fechar chamados.',
        });
      }
      dadosAtualizacao.status = statusUpper;
    }

    if (respostaTecnica !== undefined) {
      if (!ehAdmin) {
        return res.status(403).json({
          erro: 'Apenas ADMIN pode adicionar resposta técnica.',
        });
      }
      dadosAtualizacao.respostaTecnica = String(respostaTecnica).trim();
    }

    const chamadoAtualizado = await prisma.chamado.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        usuario: {
          omit: {
            password: true,
          },
        },
      },
    });

    return res.status(200).json(chamadoAtualizado);
  } catch (erro) {
    return next(erro);
  }
}

// DELETE /chamados/:id - checa 404 antes de 403
async function remover(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    const chamadoExistente = await prisma.chamado.findUnique({
      where: { id },
    });

    if (!chamadoExistente) {
      return res.status(404).json({
        erro: 'Chamado de suporte não encontrado.',
      });
    }

    if (chamadoExistente.usuarioId !== req.usuario.id && req.usuario.role !== 'ADMIN') {
      return res.status(403).json({
        erro: 'Acesso negado: você não pode remover o chamado de outro usuário.',
      });
    }

    await prisma.chamado.delete({
      where: { id },
    });

    return res.status(200).json({
      mensagem: 'Chamado removido com sucesso.',
    });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
