import { MongoClient, MongoClientOptions } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the connection
  // across module reloads caused by HMR (Hot Module Replacement)
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production, create a new client for each request
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function getDatabase(dbName: string = "handyflix") {
  const client = await clientPromise
  return client.db(dbName)
}

// Initialize database indexes (call once on startup or via a setup script)
export async function initializeIndexes() {
  const client = await clientPromise
  const db = client.db("handyflix")

  // TTL index on rateLimits — auto-delete records after 5 minutes
  await db.collection("rateLimits").createIndex(
    { lastAttempt: 1 },
    { expireAfterSeconds: 300 }
  )

  // Unique compound index for efficient rate limit lookups
  await db.collection("rateLimits").createIndex(
    { ip: 1, type: 1 },
    { unique: true }
  )

  // TTL index on watchProgress — auto-delete history older than 14 days
  // lastWatched is updated on every save, so the 14-day window resets each time the user watches
  await db.collection("watchprogresses").createIndex(
    { lastWatched: 1 },
    { expireAfterSeconds: 14 * 24 * 60 * 60 }
  )
}
