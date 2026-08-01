import { createRequire } from "module";
import { getDb, safeTarget, MONGODB_DB } from "./_db.js";

const require = createRequire(import.meta.url);

export default async function handler(req, res) {
  const report = {
    project: "Fudgelab Frontend",
    nodeVersion: process.version,
    driverVersion: "unknown",
    connectionTarget: safeTarget(),
    databaseName: MONGODB_DB,
    usingEnvVar: Boolean(process.env.MONGODB_URI),
    ping: "not attempted",
    collections: null,
    orderCount: null,
    error: null,
    errorName: null,
  };

  try {
    report.driverVersion = require("mongodb/package.json").version;
  } catch {
    /* not critical */
  }

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    report.ping = "ok";

    const collections = await db.listCollections().toArray();
    report.collections = collections.map((c) => c.name);
    report.orderCount = await db.collection("orders").countDocuments();

    return res.status(200).json(report);
  } catch (err) {
    report.ping = "failed";
    report.error = err.message;
    report.errorName = err.name;
    return res.status(500).json(report);
  }
}
