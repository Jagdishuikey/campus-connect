import Connection from '../models/ConnectionModel.js';
import User from '../models/UserModel.js';

// Search Users (for sending connection requests)
export const getUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const query = { _id: { $ne: req.user.userId }, isActive: true };

        if (search && search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } },
                { college: { $regex: search.trim(), $options: 'i' } },
            ];
        }

        const users = await User.find(query).select('name email college bio profileImage').limit(20);
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

// Send Connection Request
export const sendRequest = async (req, res) => {
    try {
        const { recipientId, message } = req.body;

        if (!recipientId) {
            return res.status(400).json({ success: false, message: 'Recipient is required' });
        }

        if (recipientId === req.user.userId) {
            return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
        }

        // Check if connection already exists
        const existing = await Connection.findOne({
            $or: [
                { requester: req.user.userId, recipient: recipientId },
                { requester: recipientId, recipient: req.user.userId },
            ]
        });

        if (existing) {
            return res.status(409).json({ success: false, message: 'Connection already exists', connection: existing });
        }

        const connection = new Connection({
            requester: req.user.userId,
            recipient: recipientId,
            message: message || '',
        });

        await connection.save();

        res.status(201).json({
            success: true,
            message: 'Connection request sent',
            connection,
        });
    } catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error sending request' });
    }
};

// Get My Connections
export const getConnections = async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [
                { requester: req.user.userId },
                { recipient: req.user.userId },
            ]
        })
            .sort({ createdAt: -1 })
            .populate('requester', 'name email college bio profileImage')
            .populate('recipient', 'name email college bio profileImage');

        res.status(200).json({ success: true, connections });
    } catch (error) {
        console.error('Get connections error:', error);
        res.status(500).json({ success: false, message: 'Error fetching connections' });
    }
};

// Update Connection (accept / reject / block)
export const updateConnection = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['accepted', 'rejected', 'blocked'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const connection = await Connection.findById(req.params.id);
        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection not found' });
        }

        // Only recipient can accept/reject
        if (connection.recipient.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this connection' });
        }

        connection.status = status;
        await connection.save();

        const updated = await Connection.findById(connection._id)
            .populate('requester', 'name email college bio profileImage')
            .populate('recipient', 'name email college bio profileImage');

        res.status(200).json({ success: true, message: `Connection ${status}`, connection: updated });
    } catch (error) {
        console.error('Update connection error:', error);
        res.status(500).json({ success: false, message: 'Error updating connection' });
    }
};
