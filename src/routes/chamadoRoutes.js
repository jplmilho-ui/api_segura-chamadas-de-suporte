const express = require('express');
const chamadoController = require('../controllers/chamadoController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

// Todas as rotas de chamados exigem que o usuário esteja autenticado
router.use(autenticar);

router.get('/', chamadoController.listar);
router.get('/:id', chamadoController.buscarPorId);
router.post('/', chamadoController.criar);
router.put('/:id', chamadoController.atualizar);
router.delete('/:id', chamadoController.remover);

module.exports = router;
