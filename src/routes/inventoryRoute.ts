import express from 'express';
import authMiddleware from '../middlewares/authMiddlewares'; // Adjust the path
import inventoryController from '../controllers/inventoryControl'; // Adjust the path

const router = express.Router();

// Protect the routes with the verifyToken middleware
router.post('/inventory', authMiddleware, inventoryController.createInventoryItem);
router.put('/inventory/:itemId', authMiddleware, inventoryController.updateInventoryItem);
router.delete('/inventory/:itemId', authMiddleware, inventoryController.deleteInventoryItem);
router.get('/inventory', inventoryController.getAllInventoryItems); // No authentication needed for listing items
router.get('/inventory/:itemId', inventoryController.getInventoryItemById); // No authentication needed for getting a specific item

export default router;
