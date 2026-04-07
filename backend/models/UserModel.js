import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ],
    unique: true,
    lowercase: true,
    trim: true
  },
  
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  
  college: {
    type: String,
    trim: true,
    default: ''
  },
  
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  
  profileImage: {
    type: String,
    default: null
  },
  
  joinedGroups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  
  subscribedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  
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

// Hook to update updatedAt before saving
userSchema.pre('save', function() {
  this.updatedAt = new Date();
});

const User = mongoose.model('User', userSchema);

export default User;
