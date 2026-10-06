import Store from '../services/store.js';

// @desc    Get all products with filtering & sorting
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { category, search, sort, featured } = req.query;

    const products = Store.getProducts({
      category,
      search,
      sort,
      featured: featured !== undefined ? featured === 'true' : undefined
    });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product by slug or ID with related items
// @route   GET /api/products/:slugOrId
const getProduct = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const product = Store.getProductByIdOrSlug(slugOrId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get "You may also like" related products (same category or popular, excluding current)
    const all = Store.getProducts();
    const related = all
      .filter((p) => p._id !== product._id)
      .slice(0, 4);

    res.json({
      success: true,
      product,
      related
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product (Admin)
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      images,
      category,
      weight,
      availableWeights,
      ingredients,
      nutrition,
      benefits,
      stock,
      featured
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Product name, price, and category are required.'
      });
    }

    // Auto-generate slug if not provided
    const productSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newProduct = Store.createProduct({
      name,
      slug: productSlug,
      description: description || '',
      shortDescription: shortDescription || '',
      price: Number(price),
      compareAtPrice: Number(compareAtPrice || 0),
      images: images && images.length ? images : ['/images/plain-makhana-bowl.png'],
      category: category.toLowerCase(),
      weight: weight || '250g',
      availableWeights: availableWeights || [
        { weight: weight || '250g', price: Number(price), compareAtPrice: Number(compareAtPrice || 0) }
      ],
      ingredients: ingredients || ['100% Pure Mithila Fox Nuts'],
      nutrition: nutrition || {
        calories: '347 kcal per 100g',
        protein: '9.7g',
        carbs: '76.9g',
        fat: '0.1g',
        fiber: '14.5g',
        calcium: '60mg'
      },
      benefits: benefits || ['High protein, low fat healthy snack'],
      stock: Number(stock !== undefined ? stock : 100),
      featured: Boolean(featured)
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = Store.updateProduct(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = Store.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
const addReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, name } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating and review comment.'
      });
    }

    const reviewerName = name || (req.user ? req.user.name : 'Verified Customer');

    const updated = Store.addProductReview(id, {
      name: reviewerName,
      rating: Number(rating),
      comment
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been added.',
      product: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get categories
// @route   GET /api/products/categories/all
const getCategories = async (req, res, next) => {
  try {
    const categories = Store.getCollection('categories');
    res.json({
      success: true,
      categories
    });
  } catch (err) {
    next(err);
  }
};

export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getCategories
};
