import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function findStoryById(id) {
  const collection = await getCollection('stories');
  return collection.findOne({ _id: new ObjectId(id) });
}

export async function findStories(query = {}, options = {}) {
  const collection = await getCollection('stories');
  return collection.find(query, options).toArray();
}

export async function createStory(storyData) {
  const collection = await getCollection('stories');
  if (!storyData.createdAt) {
    storyData.createdAt = new Date();
  }
  if (storyData.author && typeof storyData.author === 'string') {
    storyData.author = new ObjectId(storyData.author);
  }
  return collection.insertOne(storyData);
}

export async function updateStory(id, storyData) {
  const collection = await getCollection('stories');
  return collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: storyData }
  );
}

export async function deleteStory(id) {
  const collection = await getCollection('stories');
  return collection.deleteOne({ _id: new ObjectId(id) });
}

export async function findStoriesByAuthor(authorId) {
  const collection = await getCollection('stories');
  return collection.find({ author: new ObjectId(authorId) }).toArray();
}

export async function findStoriesByTag(tag) {
  const collection = await getCollection('stories');
  return collection.find({ tags: tag }).toArray();
}