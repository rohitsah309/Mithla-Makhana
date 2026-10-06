import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Check, X, Sparkles } from 'lucide-react';
import { recipeAPI } from '../services/api';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await recipeAPI.getAll();
        if (res.data.success) {
          setRecipes(res.data.recipes);
        }
      } catch (err) {
        console.error('Failed to load recipes', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="bg-hero-gradient rounded-3xl p-8 sm:p-14 border border-[#E8DEC9] text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-white px-4 py-1.5 rounded-full border border-[#D99B26]/30 shadow-sm">
          <ChefHat className="w-4 h-4 text-[#D99B26]" />
          <span className="text-xs uppercase tracking-widest text-[#4A2E1B] font-bold">
            Mithila Kitchen Traditions
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#4A2E1B]">
          Authentic Makhana Recipes
        </h1>
        <p className="text-sm text-[#6D4A32] max-w-2xl mx-auto leading-relaxed">
          From quick teatime roasts seasoned with cow ghee to celebratory royal puddings (kheer), 
          discover how our family prepares lotus seeds for wholesome daily living.
        </p>
      </div>

      {/* Recipe Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 h-80 animate-pulse border border-[#E8DEC9]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E8DEC9] shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF6F0]">
                <img
                  src={recipe.image || '/images/roasted-makhana-jar.png'}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 right-3 bg-[#FAF6F0]/90 backdrop-blur-md text-[#2D5A27] text-[11px] font-bold px-2.5 py-1 rounded-full border border-[#E8DEC9]">
                  {recipe.difficulty}
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-4 text-xs text-[#8A6D56]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#D99B26]" />
                      <span>Prep: {recipe.prepTime}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-[#2D5A27]" />
                      <span>{recipe.servings}</span>
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-[#4A2E1B] group-hover:text-[#D99B26] transition-colors">
                    {recipe.title}
                  </h3>

                  <p className="text-xs text-[#6D4A32] line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F3ECE2]">
                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="w-full py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#4A2E1B] text-[#4A2E1B] hover:text-[#FAF6F0] font-bold text-xs border border-[#E8DEC9] transition-all"
                  >
                    View Ingredients & Steps
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8DEC9] overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative aspect-[16/7] overflow-hidden bg-[#FAF6F0] flex-shrink-0">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[10px] uppercase tracking-widest text-[#F3BF58] font-bold">
                  {selectedRecipe.difficulty} Recipe • Serves {selectedRecipe.servings}
                </span>
                <h3 className="font-serif text-2xl font-bold">{selectedRecipe.title}</h3>
              </div>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <p className="text-xs text-[#6D4A32] leading-relaxed italic">
                "{selectedRecipe.description}"
              </p>

              {/* Ingredients List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A2E1B] border-b border-[#E8DEC9] pb-1.5">
                  Ingredients Required
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#6D4A32]">
                  {selectedRecipe.ingredients?.map((ing, idx) => (
                    <div key={idx} className="flex items-start space-x-2 bg-[#FAF6F0] p-2 rounded-xl border border-[#E8DEC9]">
                      <Check className="w-3.5 h-3.5 text-[#2D5A27] flex-shrink-0 mt-0.5" />
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#4A2E1B] border-b border-[#E8DEC9] pb-1.5">
                  Step-by-Step Preparation
                </h4>
                <ol className="space-y-3 text-xs text-[#6D4A32]">
                  {selectedRecipe.instructions?.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="w-5 h-5 rounded-full bg-[#4A2E1B] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF6F0] border-t border-[#E8DEC9] flex justify-end">
              <button
                onClick={() => setSelectedRecipe(null)}
                className="px-6 py-2 rounded-xl bg-[#4A2E1B] text-[#FAF6F0] text-xs font-bold hover:bg-[#27170E] transition-colors"
              >
                Close Recipe
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Recipes;
