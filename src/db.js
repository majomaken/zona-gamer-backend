import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const URL = process.env.DATABASE_URL;
const client = new MongoClient(URL);

let db; // Declarando la variable db

export async function connectDB() {
  if (db) return db;

  try {
    await client.connect(); // Método para conectar al servidor de MongoDB
    console.log('Connected successfully to MongoDB');
    db = client.db();
    return db;
  } catch (error) {
    console.error('Could not connect to MongoDB', error);
    process.exit(1);
  }
}

export function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.')
  }
  return db;
}