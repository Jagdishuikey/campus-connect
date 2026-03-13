import mongoose from "mongoose";

const lostAndFoundSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },

    description: {
        type: String,
        required: [true, 'Please provide a description'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    type: {
        type: String,
        enum: ['lost', 'found'],
        required: [true, 'Please specify if the item is lost or found']
    },

    category: {
        type: String,
        enum: ['electronics', 'documents', 'clothing', 'accessories', 'books', 'keys', 'other'],
        default: 'other'
    },

    location: {
        type: String,
        trim: true,
        default: ''
    },

    date: {
        type: Date,
        default: Date.now
    },

    image: {
        type: String,
        default: null
    },

    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Reporter is required']
    },

    contactInfo: {
        type: String,
        trim: true,
        default: ''
    },

    status: {
        type: String,
        enum: ['open', 'claimed', 'resolved'],
        default: 'open'
    },

    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    isActive: {
        type: Boolean,
        default: true
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
lostAndFoundSchema.pre('save', function () {
    this.updatedAt = new Date();
});

// Indexes for efficient queries
lostAndFoundSchema.index({ type: 1, status: 1 });
lostAndFoundSchema.index({ reportedBy: 1 });
lostAndFoundSchema.index({ date: -1 });

const LostAndFound = mongoose.model('LostAndFound', lostAndFoundSchema);

export default LostAndFound;
