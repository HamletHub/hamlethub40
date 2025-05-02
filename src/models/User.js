import { getCollection } from '@/lib/mongodb'; // Adjust this import to your actual utility path

export async function findUserByEmail(email) {
  const collection = await getCollection('users');
  return collection.findOne({ email: email.toLowerCase() });
}

export async function createUser(userData) {
  const collection = await getCollection('users');
  return collection.insertOne(userData);
}

export const userRoles = {
  USER: 'user',
  ADMIN: 'admin'
};

export function isValidRole(role) {
  return Object.values(userRoles).includes(role);
}