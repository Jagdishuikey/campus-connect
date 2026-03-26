import PG from '../models/PGModel.js';

// GET /api/pgs – fetch all PGs
export const getAllPGs = async (req, res) => {
  try {
    const pgs = await PG.find().sort({ rating: -1 }).lean();
    res.status(200).json({ success: true, pgs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch PGs', error: error.message });
  }
};

// POST /api/pgs – add a new PG (admin)
export const createPG = async (req, res) => {
  try {
    const { name, price, location, rating, amenities, type, gender, contact, image } = req.body;

    if (!name || !price || !location?.lat || !location?.lng) {
      return res.status(400).json({ success: false, message: 'Name, price, and location are required' });
    }

    const pg = await PG.create({
      name, price, location, rating, amenities, type, gender, contact, image,
    });

    res.status(201).json({ success: true, pg });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create PG', error: error.message });
  }
};

// DELETE /api/pgs/:id
export const deletePG = async (req, res) => {
  try {
    await PG.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'PG deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete PG', error: error.message });
  }
};
