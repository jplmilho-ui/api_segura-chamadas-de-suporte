const express = require('express');
const userController = require('../controllers/userController');
const autenticar = require('../middlewares/autenticar');
const autorizar = require('../middlewares/autorizar');

const router = express.Router();

// Rotas exclusivas de ADMIN: primeiro autentica (401), depois autoriza o perfil (403)
router.get('/', autenticar, autorizar('ADMIN'), userController.listar);
router.patch('/:id/role', autenticar, autorizar('ADMIN'), userController.alterarRole);

module.exports = router;
