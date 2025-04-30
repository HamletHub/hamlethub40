import { getCollection } from '@/lib/mongodb'; // Adjust this import to your actual utility path

export async function findUserByUsername(username) {
  const collection = await getCollection('users');
  return collection.findOne({ username });
}

export async function createUser(userData) {
  const collection = await getCollection('users');
  return collection.insertOne(userData);
}

export async function validateUser({ username, password }) {
  const collection = await getCollection('users');
  return collection.findOne({ username, password });
}

export const userRoles = {
  USER: 'user',
  ADMIN: 'admin'
};

export function isValidRole(role) {
  return Object.values(userRoles).includes(role);
}