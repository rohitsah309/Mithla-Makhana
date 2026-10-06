import dotenv from 'dotenv';
import Store from '../services/store.js';

dotenv.config();

console.log('Seeding Mithila Makhana database...');
Store.init();
console.log('✅ Seeding completed successfully with authentic uploaded images, recipes, and users!');
process.exit(0);
