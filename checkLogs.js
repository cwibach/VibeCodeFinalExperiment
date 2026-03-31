const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.MONGODB_DB || 'vibetwitterlike';

async function sanitize(doc) {
  const sanitized = { ...doc };
  if (sanitized._id) {
    sanitized._id = sanitized._id.toString();
  }
  if (sanitized.createdAt && sanitized.createdAt instanceof Date) {
    sanitized.createdAt = sanitized.createdAt.toISOString();
  }
  return sanitized;
}

async function main() {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    console.log(`Connected to MongoDB: ${MONGODB_URI}`);
    const db = client.db(DB_NAME);

    const logs = await db
      .collection('logs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    if (logs.length === 0) {
      console.log('No log entries found in db.logs');
      return;
    }

    const formatted = await Promise.all(logs.map((entry) => sanitize(entry)));
    formatted.forEach((entry, idx) => {
      console.log('---', idx + 1, '---');
      console.log(JSON.stringify(entry, null, 2));
    });
  } catch (error) {
    console.error('Error querying logs:', error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
