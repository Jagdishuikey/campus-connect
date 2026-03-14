import Post from '../models/PostModel.js';
import User from '../models/UserModel.js';

// GET /api/posts – fetch the latest 50 posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts', error: error.message });
  }
};

// POST /api/posts – create a new post and broadcast via socket
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Post text is required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Build avatar initials from user name
    const avatar = user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const post = await Post.create({
      author: user._id,
      authorName: user.name,
      avatar,
      text: text.trim(),
    });

    const postObj = post.toObject();

    // Broadcast to every connected client
    const io = req.app.get('io');
    if (io) {
      io.emit('new_post', postObj);
    }

    res.status(201).json({ success: true, post: postObj });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create post', error: error.message });
  }
};

// DELETE /api/posts/:id – delete own post and broadcast removal
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Only the author can delete their own post
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    // Broadcast deletion to every connected client
    const io = req.app.get('io');
    if (io) {
      io.emit('delete_post', { postId: req.params.id });
    }

    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete post', error: error.message });
  }
};
