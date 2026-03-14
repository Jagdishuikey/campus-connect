import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    required: true,
    trim: true
  },
  text: {
    type: String,
    required: [true, 'Post text is required'],
    trim: true,
    maxlength: [1000, 'Post cannot exceed 1000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Sort by newest first by default
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
