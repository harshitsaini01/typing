const express = require('express'); // Fixed: Import express instead of jsonwebtoken
const router = express.Router();
const {
  getAllPassages,
  getPassageById,
  createPassage,
  updatePassage,
  deletePassage,
  getPassagesByTestType,
} = require('../controllers/passageController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', getAllPassages);
router.get('/test/:testType', getPassagesByTestType);

// Protected routes
router.get('/:id', authMiddleware, getPassageById);
router.post('/', authMiddleware, createPassage);
router.put('/:id', authMiddleware, updatePassage);
router.delete('/:id', authMiddleware, deletePassage);

module.exports = router;