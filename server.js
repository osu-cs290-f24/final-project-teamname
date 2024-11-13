const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');  
const app = express();
const PORT = 3000;
const uri = 'mongodb://localhost:27017';
const dbName = 'gameDB';

var scoresCollection;

//Middleware
app.use(cors());
app.use(express.json());

// Function to connect to MongoDB and set up the scores collection
async function connectToMongo() {
  try {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    scoresCollection = db.collection('scores');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Endpoint to post a new score
app.post('/submit-score', async (req, res) => {
  const { score } = req.body;
  try {
    if (!scoresCollection) throw new Error('Database not initialized');
    const result = await scoresCollection.insertOne({ score });
    res.status(201).json({ message: 'Score saved successfully', id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: 'Error saving score', error: error.message });
  }
});

// Endpoint to retrieve all scores, sorted by highest score
app.get('/get-scores', async (req, res) => {
  try {
    if (!scoresCollection) throw new Error('Database not initialized');
    const scores = await scoresCollection.find().sort({ score: -1 }).toArray();
    res.status(200).json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving scores', error: error.message });
  }
});

// Start the server only after connecting to MongoDB
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});