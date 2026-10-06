import mongoose from 'mongoose';
import Store from '../services/store.js';

/**
 * Automatically sync Store collections to MongoDB Atlas
 */
const syncStoreToMongo = async () => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  try {
    const db = mongoose.connection.db;

    // 1. Sync Users (bidirectional: load any Atlas updates into Store first, then sync Store to Atlas)
    const userCol = db.collection('users');
    const existingMongoUsers = await userCol.find({}).toArray();
    if (existingMongoUsers && existingMongoUsers.length > 0) {
      const localUsers = Store.getCollection('users') || [];
      const mergedUsers = [...localUsers];
      for (const mUser of existingMongoUsers) {
        const idx = mergedUsers.findIndex(u => u.email?.toLowerCase() === mUser.email?.toLowerCase() || u._id === mUser._id);
        if (idx !== -1) {
          mergedUsers[idx] = { ...mergedUsers[idx], ...mUser };
        } else {
          mergedUsers.push(mUser);
        }
      }
      Store.saveCollection('users', mergedUsers);
    }

    const users = Store.getCollection('users');
    if (users && users.length > 0) {
      for (const u of users) {
        const { _id, ...userData } = u;
        await userCol.updateOne(
          { email: u.email },
          { $set: userData, $setOnInsert: { _id: _id || new mongoose.Types.ObjectId().toString() } },
          { upsert: true }
        );
      }
    }

    // 2. Sync Products
    const products = Store.getCollection('products');
    if (products && products.length > 0) {
      const prodCol = db.collection('products');
      for (const p of products) {
        const { _id, ...prodData } = p;
        await prodCol.updateOne(
          { slug: p.slug },
          { $set: prodData, $setOnInsert: { _id: _id || new mongoose.Types.ObjectId().toString() } },
          { upsert: true }
        );
      }
    }

    // 3. Sync Recipes
    const recipes = Store.getCollection('recipes');
    if (recipes && recipes.length > 0) {
      const recCol = db.collection('recipes');
      for (const r of recipes) {
        const { _id, ...recData } = r;
        await recCol.updateOne(
          { slug: r.slug },
          { $set: recData, $setOnInsert: { _id: _id || new mongoose.Types.ObjectId().toString() } },
          { upsert: true }
        );
      }
    }

    // 4. Sync Orders
    const orders = Store.getCollection('orders');
    if (orders && orders.length > 0) {
      const ordCol = db.collection('orders');
      for (const o of orders) {
        const { _id, ...ordData } = o;
        await ordCol.updateOne(
          { orderId: o.orderId },
          { $set: ordData, $setOnInsert: { _id: _id || new mongoose.Types.ObjectId().toString() } },
          { upsert: true }
        );
      }
    }

    // 5. Sync Coupons to MongoDB only. Coupons are no longer stored back into backend/data.
    const couponCol = db.collection('coupons');
    const localCoupons = Store.getCollection('coupons') || [];
    if (localCoupons.length > 0) {
      for (const c of localCoupons) {
        const { _id, ...couponData } = c;
        await couponCol.updateOne(
          { code: String(c.code || '').trim().toUpperCase() },
          { $set: couponData, $setOnInsert: { _id: new mongoose.Types.ObjectId() } },
          { upsert: true }
        );
      }
    } else if (await couponCol.countDocuments() === 0) {
      await couponCol.insertOne({
        code: 'MITHILA10',
        title: '10% Family Discount',
        description: '10% off on all makhana orders for family & friends',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: null,
        usageLimit: null,
        usedCount: 0,
        isActive: true,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    console.log(`🌿 MongoDB Atlas Data Synced: ${products.length} products, ${users.length} users, ${recipes.length} recipes, ${orders.length} orders, coupons in MongoDB.`);
  } catch (err) {
    console.error('MongoDB Atlas sync error (non-fatal):', err.message);
  }
};

/**
 * Save / Update a single document directly to MongoDB Atlas
 */
const saveToMongo = async (collectionName, filter, document) => {
  if (mongoose.connection.readyState !== 1) return null;
  try {
    const col = mongoose.connection.db.collection(collectionName);
    const { _id, ...docData } = document;
    const res = await col.updateOne(
      filter, 
      { $set: docData, $setOnInsert: { _id: _id || new mongoose.Types.ObjectId().toString() } }, 
      { upsert: true }
    );
    return res;
  } catch (err) {
    console.error(`Error saving to MongoDB ${collectionName}:`, err.message);
    return null;
  }
};

export {
  syncStoreToMongo,
  saveToMongo
};
