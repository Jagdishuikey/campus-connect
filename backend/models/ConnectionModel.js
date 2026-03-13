import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requester is required']
    },

    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required']
    },

    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'blocked'],
        default: 'pending'
    },

    message: {
        type: String,
        trim: true,
        maxlength: [300, 'Message cannot exceed 300 characters'],
        default: ''
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update updatedAt before saving
connectionSchema.pre('save', function () {
    this.updatedAt = new Date();
});

// Ensure a user can only send one connection request to another user
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ status: 1 });

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;
