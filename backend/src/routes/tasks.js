const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.patch('/:id/estado', taskController.updateStatus);
router.delete('/:id', taskController.delete);

module.exports = router;
