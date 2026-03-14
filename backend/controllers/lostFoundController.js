import LostAndFound from '../models/LostAndFoundModel.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Create Item
export const createItem = async (req, res) => {
    try {
        const { title, description, type, category, location, date, contactInfo } = req.body;

        if (!title || !type) {
            return res.status(400).json({ success: false, message: 'Title and type are required' });
        }

        // Upload image to Cloudinary if provided
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, 'campus-lostfound');
        }

        const item = new LostAndFound({
            title,
            description: description || '',
            type,
            category: category || 'other',
            location: location || '',
            date: date || new Date(),
            reportedBy: req.user.userId,
            contactInfo: contactInfo || '',
            image: imageUrl,
        });

        await item.save();

        res.status(201).json({
            success: true,
            message: 'Item reported successfully',
            item,
        });
    } catch (error) {
        console.error('Create item error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error reporting item' });
    }
};

// Get All Items
export const getItems = async (req, res) => {
    try {
        const items = await LostAndFound.find().sort({ createdAt: -1 }).populate('reportedBy', 'name email');
        res.status(200).json({ success: true, items });
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ success: false, message: 'Error fetching items' });
    }
};

// Delete Item
export const deleteItem = async (req, res) => {
    try {
        const item = await LostAndFound.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.reportedBy.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
        }

        await LostAndFound.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ success: false, message: 'Error deleting item' });
    }
};

// Update Item (toggle found status, etc.)
export const updateItem = async (req, res) => {
    try {
        const item = await LostAndFound.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.reportedBy;

        const updated = await LostAndFound.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Item updated', item: updated });
    } catch (error) {
        console.error('Update item error:', error);
        res.status(500).json({ success: false, message: 'Error updating item' });
    }
};
