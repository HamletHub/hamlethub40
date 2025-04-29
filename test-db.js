import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get the connection string
const uri = process.env.MONGODB_URI;
console.log('MONGODB_URI:', uri); // Debugging: Check if it’s defined

// Throw an error if the URI is missing
if (!uri) {
  throw new Error('MONGODB_URI is not defined in .env.local');
}

// Create a MongoDB client
const client = new MongoClient(uri);

// Test the connection
async function testConnection() {
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB');
    await client.close();
  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();