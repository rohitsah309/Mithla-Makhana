import Store from '../services/store.js';

// @desc    Get all recipes
// @route   GET /api/recipes
const getRecipes = (req, res, next) => {
  try {
    const recipes = Store.getRecipes();
    res.json({
      success: true,
      count: recipes.length,
      recipes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recipe by slug or ID
// @route   GET /api/recipes/:slugOrId
const getRecipe = (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    const recipe = Store.getRecipeBySlugOrId(slugOrId);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      recipe
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create recipe (Admin)
// @route   POST /api/recipes
const createRecipe = (req, res, next) => {
  try {
    const { title, description, image, prepTime, cookTime, servings, difficulty, ingredients, instructions } = req.body;

    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, ingredients, and instructions are required.'
      });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newRecipe = Store.createRecipe({
      title,
      slug,
      description,
      image: image || '/images/roasted-makhana-jar.png',
      prepTime: prepTime || '10 mins',
      cookTime: cookTime || '10 mins',
      servings: servings || '2-4',
      difficulty: difficulty || 'Easy',
      ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
      instructions: Array.isArray(instructions) ? instructions : [instructions]
    });

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe: newRecipe
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update recipe (Admin)
// @route   PUT /api/recipes/:id
const updateRecipe = (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = Store.updateRecipe(id, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe: updated
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete recipe (Admin)
// @route   DELETE /api/recipes/:id
const deleteRecipe = (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = Store.deleteRecipe(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

export {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe
};
