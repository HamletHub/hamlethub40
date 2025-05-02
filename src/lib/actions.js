'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createStory as createStoryModel } from '@/models/Story';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';

export async function createStory(formData) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const title = formData.get('title');
  const content = formData.get('content');
  const tags = formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [];

  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  const storyData = {
    title,
    content,
    tags,
    author: session.user.id,
    createdAt: new Date(),
  };
  
  // Use the createStory function from the model
  const result = await createStoryModel(storyData);

  redirect(`/stories/${result.insertedId}`);
}

export async function createAssetStory(formData) {
  try {
    // Log all form data to debug
    console.log('Form data received:', {
      title: formData.get('title'),
      description: formData.get('description'),
      townId: formData.get('townId'),
      originalImage: formData.get('originalImage')
    });
    
    const title = formData.get('title');
    const description = formData.get('description');
    const metadescription = formData.get('metadescription');
    const townId = formData.get('townId');
    const originalImage = formData.get('originalImage');
    const squareImage = formData.get('squareImage');
    const wideImage = formData.get('wideImage');
    
    if (!title || !description) {
      throw new Error('Title and description are required');
    }
    
    let hubId;
    
    // Convert townId to ObjectId if provided
    if (townId) {
      try {
        console.log('Converting townId to ObjectId:', townId);
        // The townId comes from the form as a string, convert it to ObjectId
        hubId = new ObjectId(townId);
        console.log('Converted to ObjectId successfully');
      } catch (error) {
        console.error('Invalid town ID format:', error);
        // Fallback to Ridgefield's hub ID
        hubId = new ObjectId('657a0795ef68cad2ad47912c');
      }
    } else {
      console.log('No townId provided, using default');
      // Fallback to Ridgefield's hub ID if no town selected
      hubId = new ObjectId('657a0795ef68cad2ad47912c');
    }
    
    console.log('Getting database connection');
    const db = await getDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    // Create URL-safe alias from title and append a unique 9-digit number
    const baseAlias = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueId = Math.floor(100000000 + Math.random() * 900000000); // 9-digit number
    const alias = `${baseAlias}-${uniqueId}`;
    
    // Get the current date in the correct format
    const currentDate = new Date();
    
    // Extract just the filename from the image URL
    let imageFilename = '';
    if (originalImage) {
      // Get the part after the last slash
      imageFilename = originalImage.split('/').pop();
    }
    
    // Get the town slug for the redirect
    let townSlug = 'ridgefield-connecticut'; // Default
    
    if (hubId) {
      try {
        console.log('Fetching town data for hubId:', hubId.toString());
        // Query the hub to get the slug
        const hub = await db.collection('hubs').findOne({ _id: hubId });
        console.log('Hub data found:', hub ? 'yes' : 'no');
        if (hub && hub.slug) {
          townSlug = hub.slug;
        }
      } catch (error) {
        console.error('Error fetching town slug:', error);
      }
    }
    
    const storyData = {
      hubId: hubId,
      title: title,
      type: "story",
      description: description,
      createdAt: currentDate,
      alias: alias,
      isPublic: true,
      imageUrl: imageFilename,
      status: "approved",
      state: "published",
      creatorInfo: {
        firstName: "Kerry",
        lastName: "Anne",
        userId: new ObjectId("657a0237ef68cad2ad3caf61"),
        customName: "HamletHub"
      },
      publishAt: currentDate,
      metaDescription: metadescription || '',
      source: "HH40"
    };
    
    console.log('Inserting story data');
    const result = await db.collection('assets').insertOne(storyData);
    console.log('Story inserted, ID:', result.insertedId);
    
    // Revalidate the page that displays stories
    revalidatePath('/');
    
    // Redirect to the newly created story
    if (result.insertedId) {
      const newStory = await db.collection('assets').findOne({ _id: result.insertedId });
      if (newStory) {
        redirect(`/${townSlug}/${newStory.alias}`);
      }
    }
    
    // Fallback redirect
    redirect(`/${townSlug}`);
  } catch (error) {
    console.error('Error creating story:', error);
    
    // Don't treat redirects as errors
    if (error.message === 'NEXT_REDIRECT') {
      // This is just a redirect, not an actual error
      throw error; // Re-throw the redirect to let Next.js handle it
    }
    
    throw new Error('Failed to create story. Please try again.');
  }
}

export async function updateAssetStory(formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      throw new Error('You must be logged in to edit a story');
    }

    const storyId = formData.get('storyId');
    const title = formData.get('title');
    const description = formData.get('description');
    const metadescription = formData.get('metadescription');
    const townId = formData.get('townId');
    const originalImage = formData.get('originalImage');
    const squareImage = formData.get('squareImage');
    const wideImage = formData.get('wideImage');
    
    if (!storyId || !title || !description) {
      throw new Error('Story ID, title and description are required');
    }
    
    const db = await getDatabase();
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    
    // Convert storyId to ObjectId
    const objectId = new ObjectId(storyId);
    
    // Create the update object with only fields that are provided
    const updateData = {
      title: title,
      description: description
    };
    
    // Add optional fields if they are provided
    if (metadescription) updateData.metaDescription = metadescription;
    if (originalImage) updateData.imageUrl = originalImage.split('/').pop();
    
    // Update the story
    const result = await db.collection('assets').updateOne(
      { _id: objectId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      throw new Error('Story not found');
    }
    
    // Get the town slug for the redirect
    const story = await db.collection('assets').findOne({ _id: objectId });
    if (!story) {
      throw new Error('Failed to retrieve the updated story');
    }
    
    // Get the hub to get the slug
    const hub = await db.collection('hubs').findOne({ _id: story.hubId });
    const townSlug = hub?.slug || 'ridgefield-connecticut'; // Default
    
    // Revalidate the path
    revalidatePath(`/${townSlug}/${story.alias}`);
    
    // Redirect to the updated story
    redirect(`/${townSlug}/${story.alias}`);
  } catch (error) {
    console.error('Error updating story:', error);
    
    // Don't treat redirects as errors
    if (error.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw the redirect to let Next.js handle it
    }
    
    throw new Error('Failed to update story. Please try again.');
  }
}