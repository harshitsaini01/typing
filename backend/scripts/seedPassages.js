const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Passage = require('../models/Passage');

dotenv.config();

const samplePassages = [
  {
    title: "Basic Typing Test",
    content: "The quick brown fox jumps over the lazy dog. This is a basic typing test to help you improve your typing speed and accuracy. Practice regularly to see improvement in your typing skills.",
    testTypes: ["Typing Test", "Basic Test"]
  },
  {
    title: "SSC CGL Practice",
    content: "The Staff Selection Commission conducts the Combined Graduate Level examination for recruitment to various posts in government departments. This test helps you prepare for the typing test section.",
    testTypes: ["SSC CGL", "Government Exam"]
  },
  {
    title: "SSC CHSL Practice",
    content: "The Staff Selection Commission conducts the Combined Higher Secondary Level examination for various posts. This passage is designed to help you practice for the typing test section of SSC CHSL.",
    testTypes: ["SSC CHSL", "Government Exam"]
  },
  {
    title: "RRB NTPC Practice",
    content: "The Railway Recruitment Board conducts the NTPC examination for various technical and non-technical posts. This typing test will help you prepare for the computer-based typing test.",
    testTypes: ["RRB NTPC", "Railway Exam"]
  },
  {
    title: "Junior Assistant Practice",
    content: "This typing test is designed for candidates preparing for Junior Assistant positions. It includes passages that are similar to the actual examination pattern.",
    testTypes: ["Junior Assistant", "Government Exam"]
  }
];

async function seedPassages() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing passages
    await Passage.deleteMany({});
    console.log('Cleared existing passages');

    // Insert new passages
    const result = await Passage.insertMany(samplePassages);
    console.log(`Added ${result.length} sample passages`);

    // Log the test types for verification
    const testTypes = [...new Set(result.flatMap(p => p.testTypes))];
    console.log('Available test types:', testTypes);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding passages:', error);
    process.exit(1);
  }
}

seedPassages(); 