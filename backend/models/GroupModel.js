import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a group name'],
        trim: true,
        unique: true,
        maxlength: [100, 'Group name cannot exceed 100 characters']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
        default: ''
    },

    category: {
        type: String,
        trim: true,
        default: 'other'
    },

    image: {
        type: String,
        default: null
    },

    coverImage: {
        type: String,
        default: null
    },

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Group admin is required']
    },

    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    maxMembers: {
        type: Number,
        default: null
    },

    rules: [{
        type: String,
        trim: true
    }],

    tags: [{
        type: String,
        trim: true
    }],

    isPublic: {
        type: Boolean,
        default: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    college: {
        type: String,
        trim: true,
        default: ''
    },

    memberCount: {
        type: Number,
        default: 0
    },

    rating: {
        type: mongoose.Schema.Types.Mixed,
        default: { total: 0, count: 0 }
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
groupSchema.pre('save', function () {
    this.updatedAt = new Date();
});

// Indexes for efficient queries
groupSchema.index({ name: 1 }, { unique: true });
groupSchema.index({ admin: 1 });
groupSchema.index({ tags: 1 });
groupSchema.index({ category: 1 });

const Group = mongoose.model('Group', groupSchema);

export default Group;
