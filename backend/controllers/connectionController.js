import Connection from '../models/ConnectionModel.js';
import User from '../models/UserModel.js';
import Message from '../models/MessageModel.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Get All Users with connection status
export const getUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const query = { _id: { $ne: req.user.userId } };

        if (search && search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } },
                { college: { $regex: search.trim(), $options: 'i' } },
            ];
        }

        const users = await User.find(query).select('name email college bio phone').limit(50);

        // Get all connections for this user
        const connections = await Connection.find({
            $or: [
                { requester: req.user.userId },
                { recipient: req.user.userId },
            ]
        });

        // Map connection status for each user
        const usersWithStatus = users.map(u => {
            const userObj = u.toObject();
            const conn = connections.find(c =>
                c.requester.toString() === u._id.toString() ||
                c.recipient.toString() === u._id.toString()
            );
            if (conn) {
                userObj.connectionStatus = conn.status;
                userObj.connectionId = conn._id;
                userObj.isRequester = conn.requester.toString() === req.user.userId;
            } else {
                userObj.connectionStatus = null;
            }
            return userObj;
        });

        res.status(200).json({ success: true, users: usersWithStatus });
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
            .populate('requester', 'name email college bio phone')
            .populate('recipient', 'name email college bio phone');

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
            .populate('requester', 'name email college bio phone')
            .populate('recipient', 'name email college bio phone');

        res.status(200).json({ success: true, message: `Connection ${status}`, connection: updated });
    } catch (error) {
        console.error('Update connection error:', error);
        res.status(500).json({ success: false, message: 'Error updating connection' });
    }
};

// Send Message
export const sendMessage = async (req, res) => {
    try {
        const { recipientId, content } = req.body;

        if (!recipientId || (!content?.trim() && !req.file)) {
            return res.status(400).json({ success: false, message: 'Recipient and message content or image are required' });
        }

        // Verify they are connected
        const connection = await Connection.findOne({
            status: 'accepted',
            $or: [
                { requester: req.user.userId, recipient: recipientId },
                { requester: recipientId, recipient: req.user.userId },
            ]
        });

        if (!connection) {
            return res.status(403).json({ success: false, message: 'You must be connected to send messages' });
        }

        // Upload image to Cloudinary if provided
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, 'campus-chat');
        }

        const message = new Message({
            sender: req.user.userId,
            recipient: recipientId,
            content: content ? content.trim() : '',
            image: imageUrl,
        });

        await message.save();

        const populated = await Message.findById(message._id)
            .populate('sender', 'name email')
            .populate('recipient', 'name email');

        res.status(201).json({ success: true, message: populated });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ success: false, message: 'Error sending message' });
    }
};

// Get Messages (conversation with a specific user)
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await Message.find({
            $or: [
                { sender: req.user.userId, recipient: userId },
                { sender: userId, recipient: req.user.userId },
            ]
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name email')
            .populate('recipient', 'name email');

        // Mark received messages as read
        await Message.updateMany(
            { sender: userId, recipient: req.user.userId, read: false },
            { $set: { read: true } }
        );

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
};
