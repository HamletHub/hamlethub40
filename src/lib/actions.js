'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createStory as createStoryModel } from '@/models/Story';
import { redirect } from 'next/navigation';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { getHubIdFromTownSlug } from '@/lib/hubs';

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
    const title = formData.get('title');
    const description = formData.get('description');
    const metadescription = formData.get('metadescription');
    const townSlug = formData.get('town') || 'ridgefield-connecticut'; // Default to Ridgefield if not specified
    
    if (!title || !description) {
      throw new Error('Title and description are required');
    }
    
    // Get the hub ID for the selected town
    let hubId;
    const hubIdString = getHubIdFromTownSlug(townSlug);
    
    if (hubIdString) {
      hubId = new ObjectId(hubIdString);
    } else {
      // Fallback to Ridgefield's hub ID
      hubId = new ObjectId('657a0795ef68cad2ad47912c');
    }
    
    const db = await getDatabase();
    
    const storyData = {
      hubId: hubId,
      title: title,
      description: description,
      type: "story",
      status: "pending",
      state: "published",
      createdAt: new Date().toISOString(),
      isPublic: true,
      metaDescription: metadescription || '',
      // Generate a slug/alias from the title
      alias: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    };
    
    const result = await db.collection('assets').insertOne(storyData);
    
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
    throw new Error('Failed to create story. Please try again.');
  }
}