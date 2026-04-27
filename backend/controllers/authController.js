import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '10d'
  });
};

// Helper: build user response object
const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  college: user.college,
  phone: user.phone,
  profileImage: user.profileImage,
  createdAt: user.createdAt,
});

// Register/Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse(user)
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during signup'
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Guard: if user signed up via Google and has no password
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google Sign-In. Please use the Google button to log in.'
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Google OAuth — verify token, find-or-create user, issue JWT
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, picture } = payload;
    // Google may not always provide 'name'; fallback to email prefix
    const name = payload.name || payload.given_name || email.split('@')[0];

    // 1. Check if user exists by googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // 2. Check if user exists by email (existing local account)
      user = await User.findOne({ email });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        if (!user.authProvider || user.authProvider === 'local') {
          // Keep as local if they already have a password — they can use both methods
        }
        if (!user.profileImage && picture) {
          user.profileImage = picture;
        }
        await user.save();
      } else {
        // 3. Create brand new Google user
        user = new User({
          name,
          email,
          googleId,
          authProvider: 'google',
          profileImage: picture || null,
        });
        await user.save();
      }
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: userResponse(user)
    });
  } catch (error) {
    console.error('Google auth error:', error.message);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    if (error.message?.includes('Token used too late') || error.message?.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Google token is invalid or expired. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error during Google authentication'
    });
  }
};

// Verify Token
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: userResponse(user)
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying token'
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const updateData = {};

    // Safely read form fields — req.body may be undefined if multer skips parsing
    if (req.body) {
      if (req.body.name && req.body.name.trim() !== '') updateData.name = req.body.name.trim();
      if (req.body.bio !== undefined) updateData.bio = req.body.bio.trim();
      if (req.body.college !== undefined) updateData.college = req.body.college.trim();
      if (req.body.phone !== undefined) updateData.phone = req.body.phone.trim();
    }

    // Handle profile image upload
    if (req.file) {
      try {
        const imageUrl = await uploadToCloudinary(req.file.buffer, 'campus-profiles');
        updateData.profileImage = imageUrl;
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({
          success: false,
          message: 'Image upload failed: ' + uploadErr.message
        });
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse(user)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
};

// Logout (optional - client-side mainly)
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
