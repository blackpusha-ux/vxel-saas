import dns from 'node:dns';
import { MongoClient, Db } from 'mongodb';

// Forcer la résolution DNS en IPv4 pour corriger le bug Windows / Node.js sur les URIs SRV (ECONNREFUSED ::1:27017)
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Ignorer si déjà défini
}

function getMongoUri(): string {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.trim() === '') {
    throw new Error('MONGO_URI n\'est pas configuré dans .env.local');
  }
  return uri;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getClientPromise(): Promise<MongoClient> {
  const uri = getMongoUri();

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      global._mongoClientPromise = client.connect().catch((err) => {
        // En cas d'erreur, réinitialiser la promesse pour retenter proprement
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  return client.connect();
}

export async function connectDB(dbName = 'vexel'): Promise<Db> {
  const connectedClient = await getClientPromise();
  return connectedClient.db(dbName);
}

export async function getUsersCollection() {
  const db = await connectDB('vexel');
  return db.collection('users');
}

export default getClientPromise();