const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// POST /auth/register
async function registrar(req, res, next) {
  try {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
      return res.status(400).json({
        erro: 'Os campos nome, email e password são obrigatórios.',
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        erro: 'A senha deve ter pelo menos 6 caracteres.',
      });
    }

    const emailFormatado = String(email).trim().toLowerCase();

    const jaExiste = await prisma.user.findUnique({
      where: { email: emailFormatado },
    });

    if (jaExiste) {
      return res.status(409).json({
        erro: 'Este e-mail já está cadastrado no sistema.',
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const novoUsuario = await prisma.user.create({
      data: {
        nome: String(nome).trim(),
        email: emailFormatado,
        password: passwordHash,
        role: 'USER',
      },
      omit: {
        password: true,
      },
    });

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: novoUsuario,
    });
  } catch (erro) {
    return next(erro);
  }
}

// POST /auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        erro: 'Informe o e-mail e a senha.',
      });
    }

    const emailFormatado = String(email).trim().toLowerCase();

    const usuario = await prisma.user.findUnique({
      where: { email: emailFormatado },
    });

    // Mensagem genérica para não revelar se o e-mail existe ou não
    if (!usuario) {
      return res.status(401).json({
        erro: 'E-mail ou senha inválidos.',
      });
    }

    const senhaValida = await bcrypt.compare(String(password), usuario.password);
    if (!senhaValida) {
      return res.status(401).json({
        erro: 'E-mail ou senha inválidos.',
      });
    }

    const token = jwt.sign(
      {
        sub: usuario.id,
        role: usuario.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '2h',
      }
    );

    const { password: _, ...usuarioSemSenha } = usuario;

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: usuarioSemSenha,
    });
  } catch (erro) {
    return next(erro);
  }
}

// GET /auth/me
async function perfil(req, res, next) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
      omit: {
        password: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    return res.status(200).json(usuario);
  } catch (erro) {
    return next(erro);
  }
}

// PATCH /auth/senha (extra)
async function trocarSenha(req, res, next) {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({
        erro: 'Informe a senhaAtual e a novaSenha.',
      });
    }

    if (String(novaSenha).length < 6) {
      return res.status(400).json({
        erro: 'A nova senha deve ter pelo menos 6 caracteres.',
      });
    }

    const usuario = await prisma.user.findUnique({
      where: { id: req.usuario.id },
    });

    if (!usuario) {
      return res.status(404).json({
        erro: 'Usuário não encontrado.',
      });
    }

    const senhaConfere = await bcrypt.compare(String(senhaAtual), usuario.password);
    if (!senhaConfere) {
      return res.status(401).json({
        erro: 'A senha atual está incorreta.',
      });
    }

    const novoHash = await bcrypt.hash(String(novaSenha), 10);

    await prisma.user.update({
      where: { id: req.usuario.id },
      data: { password: novoHash },
    });

    return res.status(200).json({
      mensagem: 'Senha atualizada com sucesso.',
    });
  } catch (erro) {
    return next(erro);
  }
}

module.exports = {
  registrar,
  login,
  perfil,
  trocarSenha,
};
