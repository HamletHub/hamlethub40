// Run this script with: node src/scripts/addUser.js

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('Please add your MongoDB URI to .env.local');
  process.exit(1);
}

async function addOrUpdateUser() {
  // User details - change to match the user you want to update
  const userEmail = 'accounting@hamlethub.com'; // Change this to the user's email
  
  // New user fields to add/update
  const updates = {
    password: 'Planes22', // Change this to your desired password
    role: 'admin', // Add a role field
    updatedAt: new Date()
  };

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email: userEmail });
    
    if (existingUser) {
      console.log(`User with email ${userEmail} found. Updating with password and role...`);
      
      // For production, use hashed password:
      // const salt = await bcrypt.genSalt(10);
      // updates.password = await bcrypt.hash(updates.password, salt);
      
      // Update the existing user
      const result = await db.collection('users').updateOne(
        { email: userEmail },
        { $set: updates }
      );
      
      console.log(`User updated: ${result.modifiedCount} document(s) modified`);
    } else {
      console.log(`No user found with email ${userEmail}. Creating new user...`);
      
      // Create a new user according to your document structure
      const newUser = {
        email: userEmail,
        firstName: '',
        lastName: '',
        password: updates.password, // Plain text for development
        role: updates.role,
        userType: { role: updates.role },
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriptionStatus: 'active',
        newsletterStats: null,
        defaultHubId: null,
        defaultHubAlias: null,
        stripeCustomerId: null
      };
      
      const result = await db.collection('users').insertOne(newUser);
      console.log(`New user created with id: ${result.insertedId}`);
    }
    
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await client.close();
  }
}

// Run the function
addOrUpdateUser().catch(console.error); 