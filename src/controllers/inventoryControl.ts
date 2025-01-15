import { Request, Response } from 'express';
import Inventory  from '../models/inventory'; // Adjust import path based on your model

// Create Inventory Item

export const createInventoryItem = async (req: Request, res: Response) => {
  const { name, quantity, price } = req.body;

  try {
    // Validate input
    if (!name || quantity === undefined || price === undefined) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Ensure the user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not logged in' });
      return;
    }

    // Extract userId from req.user
    const userId = req.user.id;

    // Create a new inventory item
    const newItem = new Inventory({
      name,
      quantity,
      price,
      userId, // Include userId
    });

    // Save the item to the database
    await newItem.save();

    res.status(201).json({
      message: 'Inventory item created successfully',
      item: newItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Update Inventory Item
export const updateInventoryItem = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { name, quantity, price } = req.body;

  try {
    // Find the inventory item
    const item = await Inventory.findById(itemId);
    if (!item) {
     res.status(404).json({ message: 'Inventory item not found' }) 
    return;
    }

    // Update the item details
    if (name) item.name = name;
    if (quantity !== undefined) item.quantity = quantity;
    if (price !== undefined) item.price = price;

    // Save the updated item
    await item.save();

  res.status(200).json({
      message: 'Inventory item updated successfully',
      item,
    })
    return ;
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Internal server error' })
     return;
  }
};

// Delete Inventory Item
export const deleteInventoryItem = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  try {
    // Find and delete the inventory item
    const item = await Inventory.findByIdAndDelete(itemId);
    if (!item) {
       res.status(404).json({ message: 'Inventory item not found' })
       return;
    }

     res.status(200).json({
      message: 'Inventory item deleted successfully',
    })
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' })
    return;
  }
};

// Get All Inventory Items
export const getAllInventoryItems = async (req: Request, res: Response) => {
  try {
    const items = await Inventory.find();
     res.status(200).json({ items })
    return;
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Internal server error' })
    return;
  }
};

// Get Inventory Item by ID
export const getInventoryItemById = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  try {
    const item = await Inventory.findById(itemId);
    if (!item) {
     res.status(404).json({ message: 'Inventory item not found' })
     return;
    }

     res.status(200).json({ item })
    return;
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: 'Internal server error' })
     return;
  }
};

export default {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
};
