import { Router } from 'express';
import Middleware from '../middlewares/authMiddlewares';
import { 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  getAllInventoryItems, 
  getInventoryItemById 
} from '../controllers/inventoryControl';

const router = Router();

router.post('/', Middleware, createInventoryItem); // Create an inventory item
router.put('/:itemId', Middleware, updateInventoryItem); // Update an inventory item
router.delete('/:itemId', Middleware, deleteInventoryItem); // Delete an inventory item
router.get('/', Middleware, getAllInventoryItems); // Get all inventory items
router.get('/:itemId', Middleware, getInventoryItemById); // Get an individual inventory item

export default router;
