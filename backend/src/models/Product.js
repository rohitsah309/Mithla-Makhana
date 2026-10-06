import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const weightOptionSchema = new mongoose.Schema({
  weight: { type: String, required: true }, // e.g. "100g", "250g", "500g", "1kg"
  price: { type: Number, required: true },
  compareAtPrice: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number, default: 0 },
  images: [{ type: String, required: true }],
  category: { 
    type: String, 
    required: true, 
    enum: ['plain', 'roasted', 'masala', 'flavoured', 'sweet', 'raw'],
    default: 'plain'
  },
  weight: { type: String, default: '250g' },
  availableWeights: [weightOptionSchema],
  ingredients: [{ type: String }],
  nutrition: {
    calories: { type: String, default: '347 kcal per 100g' },
    protein: { type: String, default: '9.7g' },
    carbs: { type: String, default: '76.9g' },
    fat: { type: String, default: '0.1g' },
    fiber: { type: String, default: '14.5g' },
    calcium: { type: String, default: '60mg' }
  },
  benefits: [{ type: String }],
  storageInstructions: { 
    type: String, 
    default: 'Store in an airtight container in a cool, dry place away from direct sunlight and moisture.' 
  },
  deliveryInfo: { 
    type: String, 
    default: 'Standard delivery across India within 3-5 business days. Carefully packed to ensure crispness.' 
  },
  stock: { type: Number, default: 100 },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 0 },
  reviews: [reviewSchema],
  featured: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);
