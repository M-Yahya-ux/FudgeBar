import { getDb, COLLECTION, safeTarget } from "./_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const { name, address, phone, email, product } = req.body;

  if (!name || !address || !phone || !product) {
    console.warn("⚠️ Missing required fields");
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    console.log("🛒 Inserting order for:", name, phone, "->", safeTarget());

    const db = await getDb();

    await db.collection(COLLECTION).insertOne({
      name,
      address,
      phone,
      email,
      product,
      status: "Pending",
      createdAt: new Date(),
    });

    console.log("✅ Order inserted");
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}
