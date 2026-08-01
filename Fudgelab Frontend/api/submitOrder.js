import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "fudgebar";
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your Vercel project's Environment Variables and redeploy."
    );
  }

  console.log("🔌 Connecting to MongoDB:", uri.slice(0, 50) + "...", "| db:", dbName);

  const client = new MongoClient(uri, {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    ssl: true,
    tlsAllowInvalidCertificates: false
  });

  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { name, address, phone, email, product } = req.body;

  if (!name || !address || !phone || !product) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("🛒 Inserting order for:", name, phone);

    const client = await connectToDatabase();
    const db = client.db(dbName);

    await db.collection("orders").insertOne({
      name,
      address,
      phone,
      email,
      product,
      createdAt: new Date(),
    });

    console.log("✅ Order inserted into MongoDB");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
