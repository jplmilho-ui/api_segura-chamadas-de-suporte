const express = require('express');
const authController = require('../controllers/authController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

// Rotas públicas
router.post('/register', authController.registrar);
router.post('/login', authController.login);

// Rotas protegidas (exigem token JWT válido)
router.get('/me', autenticar, authController.perfil);
router.patch('/senha', autenticar, authController.trocarSenha);

module.exports = router;
