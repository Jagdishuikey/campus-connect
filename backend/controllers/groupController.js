import Group from '../models/GroupModel.js';

// Create Group
export const createGroup = async (req, res) => {
    try {
        const { name, description, category, tags, maxMembers, rules, isPublic, college, members: memberCount } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Group name is required' });
        }

        const group = new Group({
            name,
            description: description || '',
            category: category || 'other',
            admin: req.user.userId,
            tags: tags || [],
            maxMembers: maxMembers || null,
            rules: rules || [],
            isPublic: isPublic !== undefined ? isPublic : true,
            members: [req.user.userId],
            college: college || '',
            memberCount: memberCount || 1,
            rating: { total: 0, count: 0 },
        });

        await group.save();

        res.status(201).json({
            success: true,
            message: 'Group created successfully',
            group,
        });
    } catch (error) {
        console.error('Create group error:', error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'A group with this name already exists' });
        }
        res.status(500).json({ success: false, message: error.message || 'Error creating group' });
    }
};

// Get All Groups
export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find().sort({ createdAt: -1 }).populate('admin', 'name email').populate('members', 'name email college bio');
        res.status(200).json({ success: true, groups });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ success: false, message: 'Error fetching groups' });
    }
};

// Delete Group
export const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        if (group.admin.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this group' });
        }

        await Group.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ success: false, message: 'Error deleting group' });
    }
};

// Update Group
export const updateGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.admin;

        const updated = await Group.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('admin', 'name email').populate('members', 'name email college bio');

        res.status(200).json({ success: true, message: 'Group updated', group: updated });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ success: false, message: 'Error updating group' });
    }
};

// Join Group (Register)
export const joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const userId = req.user.userId;

        // Check if already a member
        const isMember = group.members.some(m => m.toString() === userId);
        if (isMember) {
            return res.status(409).json({ success: false, message: 'Already registered in this group' });
        }

        // Check max members
        if (group.maxMembers && group.members.length >= group.maxMembers) {
            return res.status(400).json({ success: false, message: 'Group is full' });
        }

        group.members.push(userId);
        group.memberCount = group.members.length;
        await group.save();

        const updated = await Group.findById(group._id)
            .populate('admin', 'name email')
            .populate('members', 'name email college bio');

        res.status(200).json({ success: true, message: 'Successfully registered!', group: updated });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ success: false, message: 'Error joining group' });
    }
};

// Leave Group (Unregister)
export const leaveGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        const userId = req.user.userId;

        // Admin cannot leave their own group
        if (group.admin.toString() === userId) {
            return res.status(400).json({ success: false, message: 'Admin cannot leave the group' });
        }

        const isMember = group.members.some(m => m.toString() === userId);
        if (!isMember) {
            return res.status(400).json({ success: false, message: 'Not a member of this group' });
        }

        group.members = group.members.filter(m => m.toString() !== userId);
        group.memberCount = group.members.length;
        await group.save();

        const updated = await Group.findById(group._id)
            .populate('admin', 'name email')
            .populate('members', 'name email college bio');

        res.status(200).json({ success: true, message: 'Successfully unregistered', group: updated });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ success: false, message: 'Error leaving group' });
    }
};

