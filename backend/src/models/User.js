import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // Customer password
  adminPassword: { type: String }, // Dedicated Admin password (independent from customer password)
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  adminRoleTitle: { type: String },
  mustChangePassword: { type: Boolean, default: false },
  isInitialPassword: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isCustomerBlocked: { type: Boolean, default: false },
  isAdminBlocked: { type: Boolean, default: false },
  phone: { type: String, default: '' },
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified('adminPassword') && this.adminPassword) {
    const salt = await bcrypt.genSalt(10);
    this.adminPassword = await bcrypt.hash(this.adminPassword, salt);
  }
  next();
});

// Compare customer password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare admin password method
userSchema.methods.compareAdminPassword = async function (candidatePassword) {
  const target = this.adminPassword || this.password;
  return await bcrypt.compare(candidatePassword, target);
};

export default mongoose.model('User', userSchema);
