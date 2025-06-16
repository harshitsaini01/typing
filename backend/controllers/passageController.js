const Passage = require('../models/Passage');

// Get all passages (public)
const getAllPassages = async (req, res) => {
  try {
    const passages = await Passage.find();
    console.log('Fetched all passages:', passages.length);
    res.status(200).json(passages);
  } catch (error) {
    console.error('Error fetching passages:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get passage by ID (protected)
const getPassageById = async (req, res) => {
  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) {
      console.log(`Passage not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Passage not found' });
    }
    console.log('Fetched passage by ID:', passage._id);
    res.status(200).json(passage);
  } catch (error) {
    console.error('Error fetching passage by ID:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new passage (protected)
const createPassage = async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    console.log('Create passage failed: Title or content missing');
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const passage = new Passage({ title, content, testTypes: [] });
    await passage.save();
    console.log('Passage created:', passage._id);
    res.status(201).json(passage);
  } catch (error) {
    console.error('Error creating passage:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a passage (protected)
const updatePassage = async (req, res) => {
  const { title, content, testTypes } = req.body;

  if (!title || !content) {
    console.log('Update passage failed: Title or content missing');
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) {
      console.log(`Passage not found for update: ${req.params.id}`);
      return res.status(404).json({ message: 'Passage not found' });
    }

    passage.title = title;
    passage.content = content;
    if (testTypes) passage.testTypes = testTypes;
    await passage.save();

    console.log('Passage updated:', passage._id);
    res.status(200).json(passage);
  } catch (error) {
    console.error('Error updating passage:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a passage (protected)
const deletePassage = async (req, res) => {
  try {
    const passage = await Passage.findById(req.params.id);
    if (!passage) {
      console.log(`Passage not found for deletion: ${req.params.id}`);
      return res.status(404).json({ message: 'Passage not found' });
    }

    await passage.deleteOne();
    console.log('Passage deleted:', req.params.id);
    res.status(200).json({ message: 'Passage deleted' });
  } catch (error) {
    console.error('Error deleting passage:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get passages by test type (public)
const getPassagesByTestType = async (req, res) => {
  const { testType } = req.params;

  if (!testType) {
    console.log('Get passages by test type failed: testType missing');
    return res.status(400).json({ message: 'Test type is required' });
  }

  try {
    const passages = await Passage.find({ testTypes: testType });
    console.log(`Fetched passages for test type ${testType}:`, passages.length);
    res.status(200).json(passages);
  } catch (error) {
    console.error('Error fetching passages by test type:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllPassages,
  getPassageById,
  createPassage,
  updatePassage,
  deletePassage,
  getPassagesByTestType,
};