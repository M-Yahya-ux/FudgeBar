import { MongoClient } from "mongodb";

// ---------------------------------------------------------------------------
// Database connection details.
//
// These are set directly in code. If an environment variable of the same name
// exists it still wins, so you can override either value in Vercel later
// without editing this file.
//
// The leading underscore in the filename keeps Vercel from exposing this as a
// route - it is a shared module, not an API endpoint.
// ---------------------------------------------------------------------------

export const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://myubukhari_db_user:0jXNLcAt9dzxH5de@cluster0.q73yfcf.mongodb.net";

export const MONGODB_DB = process.env.MONGODB_DB || "fudgelab";

export const COLLECTION = "orders";

let clientPromise = null;

/**
 * Returns a connected Db handle, reusing the connection across warm
 * invocations. A failed connection is not cached, so the next request retries
 * instead of being stuck with a dead client.
 */
export async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    clientPromise = client.connect().catch((err) => {
      clientPromise = null;
      throw err;
    });
  }

  const client = await clientPromise;
  return client.db(MONGODB_DB);
}

/** The connection string with the username and password removed, for logging. */
export function safeTarget() {
  return MONGODB_URI.replace(/\/\/[^@]*@/, "//<credentials-hidden>@");
}
