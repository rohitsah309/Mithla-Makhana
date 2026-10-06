import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  prepTime: { type: String, default: '10 mins' },
  cookTime: { type: String, default: '15 mins' },
  servings: { type: String, default: '2-4' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Expert'], default: 'Easy' },
  ingredients: [{ type: String, required: true }],
  instructions: [{ type: String, required: true }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Recipe', recipeSchema);
