import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  console.log("🔌 Connecting to MongoDB URI:", uri?.slice(0, 50) + "...");

  const client = new MongoClient(uri);
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
    const db = client.db("fudgebar");

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
