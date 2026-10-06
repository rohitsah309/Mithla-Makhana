import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for file persistence
const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readCollection = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${collection}:`, err);
    return [];
  }
};

const writeCollection = (collection, data) => {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${collection}:`, err);
  }
};

const DEFAULT_STORE_SETTINGS = {
  businessName: 'Mithila Makhana Private Limited',
  brandName: 'Mithila Makhana',
  tagline: 'Authentic Bihar Heritage Fox Nuts',
  operatingAddress: 'Station Road, Near Makhana Research Hub, Darbhanga, Bihar - 846004, India',
  gstin: '10AAAFM1234F1Z5',
  fssai: '10424000000123',
  freeShippingThreshold: 499,
  standardShippingFee: 50,
  supportPhone: '+91 98765 43210',
  supportEmail: 'support@mithilamakhana.com',
  isStoreOpen: true
};

const readSettings = () => {
  const filePath = getFilePath('settings');
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_STORE_SETTINGS };
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return { ...DEFAULT_STORE_SETTINGS, ...data };
  } catch (err) {
    console.error('Error reading settings:', err);
    return { ...DEFAULT_STORE_SETTINGS };
  }
};

const writeSettings = (settings) => {
  const filePath = getFilePath('settings');
  try {
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing settings:', err);
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const saveMongoDoc = async (collection, filter, doc) => {
  try {
    const { saveToMongo } = await import('../config/mongoSync.js');
    return await saveToMongo(collection, filter, doc);
  } catch (e) {
    return null;
  }
};

// Initial Seed Products
const initialProducts = [
  {
    _id: 'prod_plain_01',
    name: 'Premium Plain Makhana',
    slug: 'premium-plain-makhana',
    description: 'Hand-selected, extra-large premium fox nuts naturally harvested from the wetland ecosystems of Mithila, Bihar. Light, crisp, snow-white, and packed with plant-based protein and minerals. Perfect for daily snacking or gentle roasting at home with pure desi ghee.',
    shortDescription: '100% natural, handpicked extra-large makhana directly from Mithila wetlands.',
    price: 249,
    compareAtPrice: 299,
    images: [
      '/images/plain-makhana-bowl.png',
      '/images/heritage-seeds-burlap.png',
      '/images/makhana-seeds-spoon.png'
    ],
    category: 'plain',
    weight: '250g',
    availableWeights: [
      { weight: '100g', price: 110, compareAtPrice: 135 },
      { weight: '250g', price: 249, compareAtPrice: 299 },
      { weight: '500g', price: 475, compareAtPrice: 560 },
      { weight: '1kg', price: 920, compareAtPrice: 1099 }
    ],
    ingredients: ['100% Pure Mithila Popped Fox Nuts (Lotus Seeds)'],
    nutrition: {
      calories: '347 kcal per 100g',
      protein: '9.7g',
      carbs: '76.9g',
      fat: '0.1g',
      fiber: '14.5g',
      calcium: '60mg'
    },
    benefits: [
      'Rich in plant protein and dietary fiber',
      'Low in sodium and zero trans-fat',
      'Naturally gluten-free superfood',
      'Good source of magnesium and potassium',
      'Can be part of a balanced daily diet'
    ],
    storageInstructions: 'Store in an airtight container in a cool, dry place away from direct sunlight and moisture.',
    deliveryInfo: 'Standard delivery across India within 3-5 business days. Packed in moisture-lock pouches to preserve crispness.',
    stock: 150,
    rating: 4.9,
    reviewsCount: 48,
    reviews: [
      {
        id: 'rev_1',
        name: 'Anjali Sharma',
        rating: 5,
        comment: 'The quality is noticeably superior to grocery store brands. Very large, clean, and popped evenly!',
        createdAt: new Date('2026-09-15').toISOString()
      },
      {
        id: 'rev_2',
        name: 'Vikram Choudhary',
        rating: 5,
        comment: 'Authentic Bihar makhana taste. Crisp and fresh. Our entire family loves it.',
        createdAt: new Date('2026-09-22').toISOString()
      }
    ],
    featured: true,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_roasted_02',
    name: 'Slow Roasted Makhana (Pink Salt & Ghee)',
    slug: 'roasted-makhana',
    description: 'Gently roasted in small batches to perfection with a light touch of pure cow ghee and mineral-rich Himalayan pink salt. Maximum crunch with every bite, without any oily aftertaste.',
    shortDescription: 'Slow-roasted in pure ghee with authentic Himalayan pink salt.',
    price: 279,
    compareAtPrice: 320,
    images: [
      '/images/roasted-makhana-jar.png',
      '/images/plain-makhana-bowl.png',
      '/images/cheese-flavoured-dip.png'
    ],
    category: 'roasted',
    weight: '200g',
    availableWeights: [
      { weight: '100g', price: 145, compareAtPrice: 170 },
      { weight: '200g', price: 279, compareAtPrice: 320 },
      { weight: '400g', price: 530, compareAtPrice: 620 }
    ],
    ingredients: ['Mithila Fox Nuts', 'Cold-pressed Pure Ghee', 'Himalayan Pink Salt', 'Rock Salt'],
    nutrition: {
      calories: '380 kcal per 100g',
      protein: '9.2g',
      carbs: '72.0g',
      fat: '4.5g',
      fiber: '13.8g',
      calcium: '58mg'
    },
    benefits: [
      'Gently slow roasted for effortless digestion',
      'Flavored with pure ghee and mineral salts',
      'Satisfying teatime crunch without artificial additives',
      'Guilt-free alternative to deep-fried snacks'
    ],
    storageInstructions: 'Keep in an airtight jar. Seal tightly after each use to retain crunchiness.',
    deliveryInfo: 'Delivered in food-grade resealable pouches within 3-5 working days.',
    stock: 120,
    rating: 4.8,
    reviewsCount: 36,
    reviews: [
      {
        id: 'rev_3',
        name: 'Sunita Mishra',
        rating: 5,
        comment: 'So fragrant with the aroma of pure ghee! You can tell it is freshly roasted.',
        createdAt: new Date('2026-09-18').toISOString()
      }
    ],
    featured: true,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_masala_03',
    name: 'Mithila Masala Makhana (Spice Blend)',
    slug: 'masala-makhana',
    description: 'Coated in a fragrant secret blend of traditional spices including roasted cumin, black pepper, amchur (dry mango), and mild Kashmiri paprika. An irresistible snack for tea time and family gatherings.',
    shortDescription: 'Crispy fox nuts tossed in tangy, aromatic traditional Indian spices.',
    price: 299,
    compareAtPrice: 349,
    images: [
      '/images/roasted-makhana-jar.png',
      '/images/cheese-flavoured-dip.png',
      '/images/plain-makhana-bowl.png'
    ],
    category: 'masala',
    weight: '200g',
    availableWeights: [
      { weight: '100g', price: 155, compareAtPrice: 180 },
      { weight: '200g', price: 299, compareAtPrice: 349 },
      { weight: '400g', price: 570, compareAtPrice: 660 }
    ],
    ingredients: ['Mithila Fox Nuts', 'Cold-pressed Edible Oil', 'Roasted Cumin', 'Black Pepper', 'Dry Mango Powder', 'Kashmiri Red Chilli', 'Black Salt', 'Asafoetida'],
    nutrition: {
      calories: '390 kcal per 100g',
      protein: '9.0g',
      carbs: '70.5g',
      fat: '5.2g',
      fiber: '14.0g',
      calcium: '62mg'
    },
    benefits: [
      'Tangy spices enhance appetite naturally',
      'Packed with digestive spices like cumin and black pepper',
      'High in fiber and satisfying crunch',
      'No added MSG or synthetic colors'
    ],
    storageInstructions: 'Store in an airtight jar. Best consumed within 30 days of opening for peak crispness.',
    deliveryInfo: 'Fast dispatch within 24 hours. Packed in barrier foil pouches.',
    stock: 95,
    rating: 4.9,
    reviewsCount: 52,
    reviews: [
      {
        id: 'rev_4',
        name: 'Pradeep Jha',
        rating: 5,
        comment: 'Reminds me of snacking back home in Darbhanga! Perfect balance of spice and tang.',
        createdAt: new Date('2026-09-24').toISOString()
      }
    ],
    featured: true,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_peri_04',
    name: 'Zesty Peri Peri Makhana',
    slug: 'peri-peri-makhana',
    description: 'Bold, spicy, and tangy African bird’s eye chili inspired peri peri seasoning generously dusted over crispy roasted makhana. A modern gourmet twist for flavour lovers who enjoy a touch of heat.',
    shortDescription: 'Zesty, spicy, and tangy Peri Peri seasoning on crisp roasted makhana.',
    price: 299,
    compareAtPrice: 349,
    images: [
      '/images/cheese-flavoured-dip.png',
      '/images/roasted-makhana-jar.png',
      '/images/plain-makhana-bowl.png'
    ],
    category: 'flavoured',
    weight: '200g',
    availableWeights: [
      { weight: '100g', price: 155, compareAtPrice: 180 },
      { weight: '200g', price: 299, compareAtPrice: 349 },
      { weight: '400g', price: 570, compareAtPrice: 660 }
    ],
    ingredients: ['Mithila Fox Nuts', 'Edible Vegetable Oil', 'Peri Peri Seasoning (Garlic, Onion, Paprika, Oregano, Citric Acid, Chili)', 'Rock Salt'],
    nutrition: {
      calories: '385 kcal per 100g',
      protein: '8.8g',
      carbs: '71.2g',
      fat: '4.8g',
      fiber: '13.5g',
      calcium: '55mg'
    },
    benefits: [
      'Exciting kick of spice without greasy heaviness',
      'Rich in antioxidants from natural herbs and chili',
      'Plant protein powerhouse snack'
    ],
    storageInstructions: 'Store in an airtight container in a cool, dark pantry.',
    deliveryInfo: 'Ships within 24-48 hours. Carefully cushioned in recyclable packaging.',
    stock: 80,
    rating: 4.7,
    reviewsCount: 29,
    reviews: [],
    featured: true,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_cheese_05',
    name: 'White Cheddar Cheese & Herbs Makhana',
    slug: 'cheese-makhana',
    description: 'Smooth, savory white cheddar and mild herb blend coated over crisp popped makhana. Loved by children and adults alike for wholesome guilt-free snacking during study sessions or movie nights.',
    shortDescription: 'Savory cheddar cheese and Italian herbs on crunchy roasted makhana.',
    price: 319,
    compareAtPrice: 369,
    images: [
      '/images/cheese-flavoured-dip.png',
      '/images/roasted-makhana-jar.png',
      '/images/plain-makhana-bowl.png'
    ],
    category: 'flavoured',
    weight: '200g',
    availableWeights: [
      { weight: '100g', price: 165, compareAtPrice: 190 },
      { weight: '200g', price: 319, compareAtPrice: 369 },
      { weight: '400g', price: 610, compareAtPrice: 700 }
    ],
    ingredients: ['Mithila Fox Nuts', 'Edible Vegetable Oil', 'Cheese Powder', 'Dried Parsley', 'Oregano', 'Onion Powder', 'Sea Salt'],
    nutrition: {
      calories: '410 kcal per 100g',
      protein: '10.5g',
      carbs: '68.0g',
      fat: '6.5g',
      fiber: '12.8g',
      calcium: '120mg'
    },
    benefits: [
      'Calcium boost from real cheese seasoning',
      'Kid-approved healthy tiffin snack',
      'Zero refined sugar and trans-fat free'
    ],
    storageInstructions: 'Store in an airtight container away from warmth and humidity.',
    deliveryInfo: 'Delivered in airtight pouches within 3-5 days across all PIN codes.',
    stock: 70,
    rating: 4.8,
    reviewsCount: 41,
    reviews: [],
    featured: false,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_caramel_06',
    name: 'Caramel & Organic Jaggery Makhana',
    slug: 'caramel-jaggery-makhana',
    description: 'Golden crunchy makhana glazed with pure organic Bihar jaggery (gur) and a gentle whisper of green cardamom. The ideal natural dessert snack to satisfy sweet cravings wholesome way.',
    shortDescription: 'Sweet and crunchy fox nuts glazed in natural Bihar jaggery and cardamom.',
    price: 329,
    compareAtPrice: 380,
    images: [
      '/images/roasted-makhana-jar.png',
      '/images/plain-makhana-bowl.png',
      '/images/makhana-seeds-spoon.png'
    ],
    category: 'sweet',
    weight: '200g',
    availableWeights: [
      { weight: '100g', price: 170, compareAtPrice: 200 },
      { weight: '200g', price: 329, compareAtPrice: 380 },
      { weight: '400g', price: 630, compareAtPrice: 720 }
    ],
    ingredients: ['Mithila Fox Nuts', 'Pure Organic Jaggery (Gur)', 'Desi Ghee', 'Green Cardamom', 'Himalayan Pink Salt'],
    nutrition: {
      calories: '415 kcal per 100g',
      protein: '7.8g',
      carbs: '82.0g',
      fat: '4.0g',
      fiber: '11.5g',
      calcium: '75mg'
    },
    benefits: [
      'Naturally sweetened with iron-rich organic jaggery',
      'Zero refined white sugar or artificial sweeteners',
      'Comforting dessert snack with digestive spices'
    ],
    storageInstructions: 'Keep in an airtight jar in a cool place. Do not refrigerate.',
    deliveryInfo: 'Shipped freshly coated within 24 hours of ordering.',
    stock: 85,
    rating: 4.9,
    reviewsCount: 64,
    reviews: [],
    featured: true,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'prod_raw_07',
    name: 'Sourced Mithila Makhana Seeds (Fox Nut Seeds)',
    slug: 'raw-makhana-seeds',
    description: 'Cleaned, sun-dried natural lotus seeds directly sourced from Mithila’s local agricultural ponds. Traditional raw harvest suitable for home preparation, culinary experiments, and authentic recipes.',
    shortDescription: 'Authentic harvest lotus seeds sourced directly from Mithila wetlands.',
    price: 349,
    compareAtPrice: 399,
    images: [
      '/images/makhana-seeds-spoon.png',
      '/images/heritage-seeds-burlap.png',
      '/images/plain-makhana-bowl.png'
    ],
    category: 'raw',
    weight: '500g',
    availableWeights: [
      { weight: '250g', price: 180, compareAtPrice: 210 },
      { weight: '500g', price: 349, compareAtPrice: 399 },
      { weight: '1kg', price: 670, compareAtPrice: 760 }
    ],
    ingredients: ['100% Unprocessed Lotus Seeds (Euryale Ferox)'],
    nutrition: {
      calories: '350 kcal per 100g',
      protein: '11.2g',
      carbs: '74.5g',
      fat: '0.2g',
      fiber: '15.0g',
      calcium: '70mg'
    },
    benefits: [
      'Pure raw harvest from natural aquatic ecosystem',
      'High natural protein concentration',
      'Versatile for traditional Ayurvedic & culinary preparations'
    ],
    storageInstructions: 'Store in a dry, ventilated container away from dampness.',
    deliveryInfo: 'Carefully sorted and packaged. Standard delivery 3-5 days.',
    stock: 60,
    rating: 4.8,
    reviewsCount: 19,
    reviews: [],
    featured: false,
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initial Recipes
const initialRecipes = [
  {
    _id: 'rec_01',
    title: '5-Minute Roasted Masala Makhana',
    slug: 'roasted-masala-makhana',
    description: 'The definitive everyday teatime snack. Crunchy, fragrant with desi ghee and spiced to perfection.',
    image: '/images/roasted-makhana-jar.png',
    prepTime: '5 mins',
    cookTime: '5 mins',
    servings: '2-4 persons',
    difficulty: 'Easy',
    ingredients: [
      '2 cups Mithila Plain Makhana',
      '1 tbsp Pure Desi Ghee or Cold-pressed Oil',
      '1/2 tsp Turmeric Powder (Haldi)',
      '1/2 tsp Roasted Cumin Powder (Jeera)',
      '1/2 tsp Chaat Masala',
      '1/4 tsp Kashmiri Red Chili Powder',
      'Pink Salt or Black Salt to taste'
    ],
    instructions: [
      'Heat 1 tablespoon pure ghee in a heavy-bottomed pan or kadhai on low flame.',
      'Add the Mithila Plain Makhana and roast slowly, stirring continuously for 4-5 minutes.',
      'Test a piece by crushing between your fingers. It should shatter with a crisp crunch.',
      'Turn off the heat. Immediately sprinkle turmeric, roasted cumin powder, chaat masala, chili powder, and pink salt.',
      'Toss well so the warm ghee binds the spices to the makhana. Let cool slightly and serve crisp!'
    ],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'rec_02',
    title: 'Royal Mithila Makhana Kheer',
    slug: 'makhana-kheer',
    description: 'A luxurious, fragrant lotus seed pudding infused with cardamom, saffron, and slow-simmered milk.',
    image: '/images/plain-makhana-bowl.png',
    prepTime: '10 mins',
    cookTime: '20 mins',
    servings: '4 persons',
    difficulty: 'Medium',
    ingredients: [
      '1.5 cups Mithila Plain Makhana',
      '1 litre Full Cream Milk',
      '4-5 tbsp Organic Jaggery or Cane Sugar',
      '1/4 tsp Green Cardamom Powder',
      '10-12 slivered Almonds and Pistachios',
      '6-8 strands of Saffron (Kesar)',
      '1 tsp Ghee for roasting'
    ],
    instructions: [
      'Lightly roast the makhana in 1 tsp ghee for 3 minutes until crisp. Allow to cool.',
      'Divide makhana into two halves: keep one half whole, and coarsely crush the second half in a mortar or pulse briefly.',
      'In a wide saucepan, bring full-cream milk to a boil and let it gently simmer for 8-10 minutes until slightly thickened.',
      'Add both the whole and crushed makhana into the simmering milk. Cook on low flame for 10-12 minutes, stirring occasionally, until makhana turns soft and absorbs the milk.',
      'Add cardamom powder, saffron strands, and sweetener. Simmer for 2 more minutes.',
      'Garnish with slivered almonds and pistachios. Serve warm or chilled.'
    ],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'rec_03',
    title: 'Street-Style Tangy Makhana Chaat',
    slug: 'makhana-chaat',
    description: 'A vibrant, light, and tangy street-style chaat loaded with fresh veggies, chutneys, and crisp roasted makhana.',
    image: '/images/cheese-flavoured-dip.png',
    prepTime: '10 mins',
    cookTime: '5 mins',
    servings: '2 persons',
    difficulty: 'Easy',
    ingredients: [
      '2 cups Roasted Salted Mithila Makhana',
      '1 medium Onion, finely diced',
      '1 medium Tomato, deseeded and diced',
      '1 Green Chili, finely chopped (optional)',
      '2 tbsp Fresh Mint-Coriander Chutney',
      '1.5 tbsp Sweet Tamarind Chutney',
      '1 tsp Chaat Masala and Roasted Cumin',
      '1 tbsp Pomegranate arils',
      'Fresh Coriander leaves for garnish'
    ],
    instructions: [
      'In a wide mixing bowl, combine diced onions, tomatoes, green chillies, and pomegranate arils.',
      'Sprinkle chaat masala and roasted cumin powder.',
      'Just before serving, add the freshly roasted crunchy Mithila Makhana to avoid sogginess.',
      'Drizzle the green mint chutney and sweet tamarind chutney on top.',
      'Toss swiftly and gently with two spoons. Garnish with fresh coriander leaves and serve instantly.'
    ],
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'rec_04',
    title: 'Caramel & Jaggery Honeycomb Makhana',
    slug: 'caramel-makhana',
    description: 'Crispy clusters glazed in rich Bihar jaggery and roasted sesame seeds. The ultimate healthy sweet craving.',
    image: '/images/roasted-makhana-jar.png',
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: '4 persons',
    difficulty: 'Easy',
    ingredients: [
      '2 cups Mithila Plain Makhana',
      '3/4 cup Crushed Organic Jaggery (Gur)',
      '1 tbsp Pure Desi Ghee',
      '1 tbsp White Sesame Seeds (Til)',
      '1/4 tsp Cardamom Powder',
      'A pinch of Baking Soda (for airy honeycomb crunch)',
      'A pinch of Rock Salt'
    ],
    instructions: [
      'Dry roast the makhana on low heat for 5 minutes until fully brittle. Set aside.',
      'In the same pan, melt 1 tbsp ghee and crushed jaggery on low flame with 1 tsp water until jaggery melts and begins to bubble into a caramel syrup.',
      'Check caramel readiness by dropping a bit in cold water; it should form a soft candy ball.',
      'Turn off heat. Add cardamom powder, sesame seeds, pinch of salt, and baking soda. The syrup will froth up.',
      'Immediately dump the roasted makhana into the pan and stir quickly until all makhana pieces are coated in glossy jaggery.',
      'Transfer onto parchment paper or greased plate. Separate into pieces while warm. Once cooled, store in an airtight jar.'
    ],
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'rec_05',
    title: 'Zesty Garlic-Herb Roasted Makhana',
    slug: 'spicy-makhana-snack',
    description: 'Crisp popped lotus seeds tossed in roasted garlic, paprika, oregano, and served with a cool yogurt dip.',
    image: '/images/cheese-flavoured-dip.png',
    prepTime: '5 mins',
    cookTime: '6 mins',
    servings: '2 persons',
    difficulty: 'Easy',
    ingredients: [
      '2 cups Mithila Plain Makhana',
      '1 tbsp Cold-Pressed Olive Oil or Ghee',
      '1/2 tsp Garlic Powder',
      '1/2 tsp Dried Oregano / Mixed Italian Herbs',
      '1/2 tsp Smoked Paprika or Chili Flakes',
      'Pink Himalayan Salt to taste'
    ],
    instructions: [
      'Heat oil in a wide skillet on low heat.',
      'Add makhana and roast gently for 5 minutes until crisp and golden.',
      'Turn off the stove. Add garlic powder, dried herbs, paprika, and salt.',
      'Toss thoroughly so the warm oil carries the garlic and herbs into every crevice.',
      'Serve warm alongside a chilled creamy dip or homemade curd dip.'
    ],
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Initial Categories
const initialCategories = [
  { id: 'cat_all', name: 'All Products', slug: 'all' },
  { id: 'cat_plain', name: 'Plain & Natural', slug: 'plain' },
  { id: 'cat_roasted', name: 'Ghee Roasted', slug: 'roasted' },
  { id: 'cat_masala', name: 'Spiced & Masala', slug: 'masala' },
  { id: 'cat_flavoured', name: 'Gourmet Flavoured', slug: 'flavoured' },
  { id: 'cat_sweet', name: 'Sweet & Caramel', slug: 'sweet' },
  { id: 'cat_raw', name: 'Raw Harvest Seeds', slug: 'raw' }
];

// Initialize Collections with seed data if empty
const initData = () => {
  const products = readCollection('products');
  if (products.length === 0) {
    writeCollection('products', initialProducts);
    console.log('✅ Initialized products data');
  }

  const recipes = readCollection('recipes');
  if (recipes.length === 0) {
    writeCollection('recipes', initialRecipes);
    console.log('✅ Initialized recipes data');
  }

  const categories = readCollection('categories');
  if (categories.length === 0) {
    writeCollection('categories', initialCategories);
  }

  const users = readCollection('users');
  if (users.length === 0) {
    // Seed default admin and customer
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const customerPasswordHash = bcrypt.hashSync('customer123', 10);

    const defaultUsers = [
      {
        _id: 'usr_admin_01',
        name: 'Mithila Makhana Admin',
        email: 'admin@mithilamakhana.com',
        password: customerPasswordHash, // Customer password for retail storefront
        adminPassword: adminPasswordHash, // Dedicated admin password for operations portal
        role: 'admin',
        adminRoleTitle: 'Super Administrator',
        phone: '+91 9876543210',
        addresses: [
          {
            fullName: 'Mithila Makhana Operations',
            phone: '+91 9876543210',
            address: 'Mithila Heritage Estate, Darbhanga Road',
            city: 'Madhubani',
            state: 'Bihar',
            pincode: '847211',
            isDefault: true
          }
        ],
        wishlist: [],
        createdAt: new Date().toISOString()
      },
      {
        _id: 'usr_customer_01',
        name: 'Rohit Kumar',
        email: 'customer@mithilamakhana.com',
        password: customerPasswordHash,
        role: 'customer',
        phone: '+91 9812345678',
        addresses: [
          {
            fullName: 'Rohit Kumar',
            phone: '+91 9812345678',
            address: 'Flat 402, Lotus Greens, Boring Road',
            city: 'Patna',
            state: 'Bihar',
            pincode: '800001',
            isDefault: true
          }
        ],
        wishlist: ['prod_plain_01', 'prod_masala_03'],
        createdAt: new Date().toISOString()
      }
    ];
    writeCollection('users', defaultUsers);
    console.log('✅ Initialized default admin & customer users');
  }

  const orders = readCollection('orders');
  if (orders.length === 0) {
    const defaultOrders = [
      {
        _id: 'ord_sample_01',
        orderId: 'MM-2026-7841',
        user: 'usr_customer_01',
        customer: {
          name: 'Rohit Kumar',
          email: 'customer@mithilamakhana.com',
          phone: '+91 9812345678'
        },
        items: [
          {
            product: 'prod_plain_01',
            name: 'Premium Plain Makhana',
            image: '/images/plain-makhana-bowl.png',
            price: 249,
            weight: '250g',
            quantity: 2,
            subtotal: 498
          },
          {
            product: 'prod_masala_03',
            name: 'Mithila Masala Makhana (Spice Blend)',
            image: '/images/roasted-makhana-jar.png',
            price: 299,
            weight: '200g',
            quantity: 1,
            subtotal: 299
          }
        ],
        shippingAddress: {
          fullName: 'Rohit Kumar',
          mobile: '+91 9812345678',
          email: 'customer@mithilamakhana.com',
          address: 'Flat 402, Lotus Greens, Boring Road',
          city: 'Patna',
          state: 'Bihar',
          pincode: '800001'
        },
        subtotal: 797,
        shippingFee: 0,
        discount: 0,
        total: 797,
        paymentStatus: 'completed',
        paymentMethod: 'razorpay',
        orderStatus: 'Shipped',
        statusHistory: [
          { status: 'Order Placed', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), notes: 'Order placed online' },
          { status: 'Confirmed', timestamp: new Date(Date.now() - 86400000 * 1.8).toISOString(), notes: 'Payment verified' },
          { status: 'Processing', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(), notes: 'Batch freshly packaged' },
          { status: 'Packed', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), notes: 'Sealed in moisture-proof barrier pouches' },
          { status: 'Shipped', timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(), notes: 'Handed over to courier express' }
        ],
        razorpayOrderId: 'order_MithilaTest101',
        razorpayPaymentId: 'pay_MithilaTest202',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    writeCollection('orders', defaultOrders);
    console.log('✅ Initialized sample order');
  }

  const contacts = readCollection('contacts');
  if (contacts.length === 0) {
    const defaultContacts = [
      {
        _id: 'msg_01',
        name: 'Deepak Verma',
        email: 'deepak.verma@example.com',
        phone: '+91 9988776655',
        subject: 'Wholesale / Family Bulk Order Query',
        message: 'Hello, we are organizing a family function in Bihar and want to order 20kg of Premium Plain and Roasted Makhana. Do you offer bulk packaging?',
        status: 'new',
        createdAt: new Date().toISOString()
      }
    ];
    writeCollection('contacts', defaultContacts);
  }
};

// Data Store API Methods
const Store = {
  init: initData,

  // Generic Helpers
  getCollection: (name) => readCollection(name),
  saveCollection: (name, data) => writeCollection(name, data),

  // Products
  getProducts: (filter = {}) => {
    let list = readCollection('products');
    if (filter.category && filter.category !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
      );
    }
    if (filter.featured !== undefined) {
      list = list.filter((p) => p.featured === Boolean(filter.featured));
    }
    if (filter.sort) {
      if (filter.sort === 'price-low') list.sort((a, b) => a.price - b.price);
      else if (filter.sort === 'price-high') list.sort((a, b) => b.price - a.price);
      else if (filter.sort === 'popular') list.sort((a, b) => b.rating - a.rating);
      else if (filter.sort === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list;
  },

  getProductByIdOrSlug: (idOrSlug) => {
    const list = readCollection('products');
    return list.find((p) => p._id === idOrSlug || p.slug === idOrSlug) || null;
  },

  createProduct: (productData) => {
    const list = readCollection('products');
    const newProduct = {
      _id: 'prod_' + generateId(),
      ...productData,
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 0,
      reviews: productData.reviews || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newProduct);
    writeCollection('products', list);
    return newProduct;
  },

  updateProduct: (id, updateData) => {
    const list = readCollection('products');
    const index = list.findIndex((p) => p._id === id || p.slug === id);
    if (index === -1) return null;
    list[index] = {
      ...list[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    writeCollection('products', list);
    return list[index];
  },

  deleteProduct: (id) => {
    const list = readCollection('products');
    const filtered = list.filter((p) => p._id !== id && p.slug !== id);
    writeCollection('products', filtered);
    return true;
  },

  addProductReview: (productId, reviewData) => {
    const list = readCollection('products');
    const index = list.findIndex((p) => p._id === productId || p.slug === productId);
    if (index === -1) return null;
    const review = {
      id: 'rev_' + generateId(),
      ...reviewData,
      createdAt: new Date().toISOString()
    };
    list[index].reviews = list[index].reviews || [];
    list[index].reviews.unshift(review);
    list[index].reviewsCount = list[index].reviews.length;
    // Calculate new average rating
    const total = list[index].reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    list[index].rating = parseFloat((total / list[index].reviewsCount).toFixed(1));
    writeCollection('products', list);
    return list[index];
  },

  // Users
  getUserByEmail: (email) => {
    const list = readCollection('users');
    return list.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  getUserById: (id) => {
    const list = readCollection('users');
    return list.find((u) => u._id === id) || null;
  },

  createUser: (userData) => {
    const list = readCollection('users');
    const newUser = {
      _id: 'usr_' + generateId(),
      addresses: [],
      wishlist: [],
      role: userData.role || 'customer',
      ...userData,
      createdAt: new Date().toISOString()
    };
    list.push(newUser);
    writeCollection('users', list);
    saveMongoDoc('users', { email: newUser.email }, newUser);
    return newUser;
  },

  updateUser: (id, updateData) => {
    const list = readCollection('users');
    const index = list.findIndex((u) => u._id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updateData, updatedAt: new Date().toISOString() };
    writeCollection('users', list);
    saveMongoDoc('users', { email: list[index].email }, list[index]);
    return list[index];
  },

  getAllUsers: async () => {
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const mongoUsers = await mongoose.connection.db.collection('users').find({}).toArray();
        if (mongoUsers && mongoUsers.length > 0) {
          const localList = readCollection('users');
          const merged = mongoUsers.map(mu => {
            const local = localList.find(l => l.email === mu.email || l._id === mu._id);
            return { ...(local || {}), ...mu };
          });
          writeCollection('users', merged);
          return merged.map((u) => {
            const { password, adminPassword, ...safeUser } = u;
            return safeUser;
          });
        }
      }
    } catch (e) {
      console.error('Error fetching users from MongoDB in getAllUsers:', e.message);
    }

    const list = readCollection('users');
    return list.map((u) => {
      const { password, adminPassword, ...safeUser } = u;
      return safeUser;
    });
  },

  toggleUserBlock: async (id, isBlocked, target = 'customer') => {
    const list = readCollection('users');
    const index = list.findIndex((u) => u._id === id);
    if (index === -1) return null;

    const user = list[index];

    if (target === 'admin') {
      const current = Boolean(user.isAdminBlocked ?? (user.isAdminBlocked === undefined && user.isBlocked));
      const targetStatus = typeof isBlocked === 'boolean' ? isBlocked : !current;
      user.isAdminBlocked = targetStatus;
      user.adminBlockedAt = targetStatus ? new Date().toISOString() : null;
      // If user is purely an administrator account, synchronize isBlocked for admin
      if (user.role === 'admin') {
        user.isBlocked = targetStatus;
        user.blockedAt = targetStatus ? new Date().toISOString() : null;
      }
    } else {
      // Customer block
      const current = Boolean(user.isCustomerBlocked ?? (user.isCustomerBlocked === undefined && user.isBlocked));
      const targetStatus = typeof isBlocked === 'boolean' ? isBlocked : !current;
      user.isCustomerBlocked = targetStatus;
      user.customerBlockedAt = targetStatus ? new Date().toISOString() : null;
      // If user is a customer, ALWAYS synchronize isBlocked so MongoDB Compass & standard checks reflect it
      if (user.role !== 'admin') {
        user.isBlocked = targetStatus;
        user.blockedAt = targetStatus ? new Date().toISOString() : null;
      }
    }

    user.updatedAt = new Date().toISOString();
    list[index] = user;
    writeCollection('users', list);

    // Save directly to MongoDB Atlas and await completion so MongoDB Compass updates immediately
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const userCol = mongoose.connection.db.collection('users');
        const { _id, ...docData } = user;
        const res = await userCol.updateOne(
          { $or: [{ email: user.email }, { _id: user._id }] },
          { $set: docData, $setOnInsert: { _id: _id || new mongoose.Types.ObjectId().toString() } },
          { upsert: true }
        );
        console.log(`🌿 MongoDB Atlas user block updated: ${user.email} -> isCustomerBlocked: ${user.isCustomerBlocked}, isAdminBlocked: ${user.isAdminBlocked}, isBlocked: ${user.isBlocked} (matched: ${res.matchedCount}, modified: ${res.modifiedCount})`);
      }
    } catch (mErr) {
      console.error('Failed saving block status to MongoDB Atlas:', mErr.message);
    }

    const { password, adminPassword, ...safeUser } = user;
    return safeUser;
  },

  deleteUser: (id) => {
    const list = readCollection('users');
    const index = list.findIndex((u) => u._id === id);
    if (index === -1) return false;
    const deleted = list.splice(index, 1)[0];
    writeCollection('users', list);
    if (deleted?.email) {
      try {
        if (mongoose.connection.readyState === 1) {
          mongoose.connection.db.collection('users').deleteOne({ email: deleted.email });
        }
      } catch (e) {}
    }
    return true;
  },

  // Orders
  getOrders: (filter = {}) => {
    let list = readCollection('orders');
    if (filter.userId) {
      list = list.filter((o) => o.user === filter.userId);
    }
    if (filter.status) {
      list = list.filter((o) => o.orderStatus === filter.status);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }
    // Most recent orders first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  },

  getOrderById: (orderIdOrId) => {
    const list = readCollection('orders');
    const order = list.find((o) => o._id === orderIdOrId || o.orderId === orderIdOrId);
    if (!order) return null;
    if (!order.invoiceNumber) {
      order.invoiceNumber = order.orderId ? `INV-${order.orderId.replace('MM-', '')}` : `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!order.invoiceDate) {
      order.invoiceDate = order.createdAt || new Date().toISOString();
    }
    return order;
  },

  createOrder: (orderData) => {
    const list = readCollection('orders');
    const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const orderId = `MM-${year}-${uniqueNumber}`;
    const invoiceNumber = `INV-${year}-${uniqueNumber}`;
    const newOrder = {
      _id: 'ord_' + generateId(),
      orderId,
      invoiceNumber,
      invoiceDate: new Date().toISOString(),
      orderStatus: 'Order Placed',
      paymentStatus: orderData.paymentStatus || 'completed',
      statusHistory: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          notes: 'Order confirmed and placed successfully'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...orderData
    };
    list.unshift(newOrder);
    writeCollection('orders', list);
    return newOrder;
  },

  updateOrderStatus: (orderId, status, notes = '', trackingInfo = {}) => {
    const list = readCollection('orders');
    const index = list.findIndex((o) => o._id === orderId || o.orderId === orderId);
    if (index === -1) return null;

    list[index].orderStatus = status;
    list[index].updatedAt = new Date().toISOString();
    if (trackingInfo && trackingInfo.courier !== undefined) list[index].courier = trackingInfo.courier;
    if (trackingInfo && trackingInfo.trackingNumber !== undefined) list[index].trackingNumber = trackingInfo.trackingNumber;
    if (trackingInfo && trackingInfo.estimatedDelivery !== undefined) list[index].estimatedDelivery = trackingInfo.estimatedDelivery;

    list[index].statusHistory = list[index].statusHistory || [];
    list[index].statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      notes: notes || `Status updated to ${status}`
    });

    writeCollection('orders', list);
    saveMongoDoc('orders', { $or: [{ _id: list[index]._id }, { orderId: list[index].orderId }] }, list[index]);
    return list[index];
  },

  updatePaymentStatus: (orderId, paymentStatus, notes = '') => {
    const list = readCollection('orders');
    const index = list.findIndex((o) => o._id === orderId || o.orderId === orderId);
    if (index === -1) return null;

    list[index].paymentStatus = paymentStatus;
    list[index].updatedAt = new Date().toISOString();
    list[index].statusHistory = list[index].statusHistory || [];
    list[index].statusHistory.push({
      status: `Payment: ${paymentStatus === 'completed' ? 'Received' : 'Pending'}`,
      timestamp: new Date().toISOString(),
      notes: notes || `Payment status updated to ${paymentStatus}`
    });

    writeCollection('orders', list);
    return list[index];
  },

  // Recipes
  getRecipes: () => {
    return readCollection('recipes');
  },

  getRecipeBySlugOrId: (slugOrId) => {
    const list = readCollection('recipes');
    return list.find((r) => r.slug === slugOrId || r._id === slugOrId) || null;
  },

  createRecipe: (recipeData) => {
    const list = readCollection('recipes');
    const newRecipe = {
      _id: 'rec_' + generateId(),
      ...recipeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.unshift(newRecipe);
    writeCollection('recipes', list);
    return newRecipe;
  },

  updateRecipe: (id, updateData) => {
    const list = readCollection('recipes');
    const index = list.findIndex((r) => r._id === id || r.slug === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updateData, updatedAt: new Date().toISOString() };
    writeCollection('recipes', list);
    return list[index];
  },

  deleteRecipe: (id) => {
    const list = readCollection('recipes');
    const filtered = list.filter((r) => r._id !== id && r.slug !== id);
    writeCollection('recipes', filtered);
    return true;
  },

  // Contacts
  saveContactMessage: (msgData) => {
    const list = readCollection('contacts');
    const newMsg = {
      _id: 'msg_' + generateId(),
      ...msgData,
      status: 'new',
      createdAt: new Date().toISOString()
    };
    list.unshift(newMsg);
    writeCollection('contacts', list);
    return newMsg;
  },

  getContactMessages: () => {
    return readCollection('contacts');
  },

  updateContactStatus: (id, status) => {
    const list = readCollection('contacts');
    const index = list.findIndex((m) => m._id === id);
    if (index === -1) return null;
    list[index].status = status;
    writeCollection('contacts', list);
    return list[index];
  },

  // Store settings (delivery rules, business profile, support contacts)
  getSettings: () => readSettings(),

  updateSettings: (updates = {}) => {
    const current = readSettings();
    const next = {
      ...current,
      ...updates,
      freeShippingThreshold: Math.max(0, Number(updates.freeShippingThreshold ?? current.freeShippingThreshold) || 0),
      standardShippingFee: Math.max(0, Number(updates.standardShippingFee ?? current.standardShippingFee) || 0),
      updatedAt: new Date().toISOString()
    };
    writeSettings(next);
    saveMongoDoc('settings', { _id: 'store_settings' }, { _id: 'store_settings', ...next });
    return next;
  }
};

export default Store;
