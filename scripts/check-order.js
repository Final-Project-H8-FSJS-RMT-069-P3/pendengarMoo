#!/usr/bin/env node
// Usage: node scripts/check-order.js ORDER-xxxxxxxx
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function main() {
  const orderId = process.argv[2];
  if (!orderId) {
    console.error('Usage: node scripts/check-order.js ORDER-xxxx');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'final-project-db';

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const order = await db.collection('Orders').findOne({ orderId });
    if (!order) {
      console.log('Order not found for', orderId);
    } else {
      console.log('Order found:');
      console.dir(order, { depth: null });
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main();
