import Event from '../models/EventModel.js';

// Create Event
export const createEvent = async (req, res) => {
    try {
        const { title, description, category, date, endDate, time, location, organizerName, tags, maxAttendees, isPublic, poll } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        const event = new Event({
            title,
            description: description || '',
            category: category || 'other',
            date,
            endDate: endDate || null,
            time: time || '',
            location,
            organizer: req.user.userId,
            organizerName: organizerName || '',
            tags: tags || [],
            maxAttendees: maxAttendees || null,
            isPublic: isPublic !== undefined ? isPublic : true,
            poll: poll || null,
        });

        await event.save();

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event,
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ success: false, message: error.message || 'Error creating event' });
    }
};

// Get All Events
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 }).populate('organizer', 'name email');
        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ success: false, message: 'Error fetching events' });
    }
};

// Delete Event
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ success: false, message: 'Error deleting event' });
    }
};

// Update Event
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.organizer;

        const updated = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Event updated', event: updated });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ success: false, message: 'Error updating event' });
    }
};
