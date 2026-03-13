import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide an event title'],
        trim: true,
        maxlength: [150, 'Title cannot exceed 150 characters']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
        default: ''
    },

    category: {
        type: String,
        enum: ['workshop', 'seminar', 'cultural', 'sports', 'tech', 'social', 'other'],
        default: 'other'
    },

    date: {
        type: Date,
        default: null
    },

    endDate: {
        type: Date,
        default: null
    },

    time: {
        type: String,
        trim: true,
        default: ''
    },

    location: {
        type: String,
        trim: true,
        default: ''
    },

    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide an organizer']
    },

    organizerName: {
        type: String,
        trim: true,
        default: ''
    },

    image: {
        type: String,
        default: null
    },

    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    maxAttendees: {
        type: Number,
        default: null
    },

    tags: [{
        type: String,
        trim: true
    }],

    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },

    isPublic: {
        type: Boolean,
        default: true
    },

    poll: {
        type: mongoose.Schema.Types.Mixed,
        default: null
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
eventSchema.pre('save', function () {
    this.updatedAt = new Date();
});

// Indexes for efficient queries
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ tags: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
