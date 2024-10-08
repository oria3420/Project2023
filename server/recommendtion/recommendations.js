const globals = require('../../client/src/common/tablesNames');
const Collection = require('../models/collection.model');
const TABLE_NAMES = globals.TABLE_NAMES;

const UsersProfile = require('../models/usersProfile.model');
const RecipesVectors = require('../models/recipesVectors.model');
const { collection } = require('../models/user.model');

const cosineSimilarity = (vec1, vec2) => {
    // console.log("vec1: ", vec1);
    // console.log("vec2: ", vec2);
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i].value, 0); // Adjusted to access 'value' property in vec2
    // console.log("dotProduct: ", dotProduct);
    if (dotProduct === 0) {
        return 0;
    }
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val.value * val.value, 0)); // Adjusted to access 'value' property in vec2
    // console.log("magnitude1: ", magnitude1);
    // console.log("magnitude2: ", magnitude2);
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0; // Avoid division by zero
    }
    return dotProduct / (magnitude1 * magnitude2);
};


const recommendRecipes = async (userId) => {
    try {
        const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);

        // Fetch user profile vector, all recipe vectors, and user's favorite recipes in parallel
        const [userProfile, allRecipes, userFavorites] = await Promise.all([
            UsersProfile.findOne({ user_id: userId }).select('vector'),
            RecipesVectors.find({}, { recipeId: 1, vector: 1 }),
            Favorites.find({ user_id: userId }).select('recipe_id')
        ]);
    
        // If the user doesn't have a profile, return top 3 recipes by overall rating
        if (!userProfile || userFavorites.length === 0 || userId === "Guest") {
            console.log("!userProfile || Favorites.length === 0")
            const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
            const topRatedRecipes = await Recipes.find({})
                .sort({ AggregatedRating: -1 })
                .limit(6)
                .exec();
            return topRatedRecipes.map(recipe => ({ recipe, similarityScore: null }));
        }

        const userVector = userProfile.vector.map(entry => entry.value);
        const favoriteRecipeIds = new Set(userFavorites.map(fav => fav.recipe_id));

        // Compute similarity scores for recipes that are not in the user's favorites
        const similarityPromises = allRecipes
            .filter(recipe => !favoriteRecipeIds.has(recipe.recipeId))
            .map(async (recipe) => {
                const similarityScore = cosineSimilarity(userVector, recipe.vector);
                return { recipeId: recipe.recipeId, similarityScore };
            });

        // Wait for all similarity calculations to complete
        const recommendations = await Promise.all(similarityPromises);

        // Sort recommendations by similarity score
        recommendations.sort((a, b) => b.similarityScore - a.similarityScore);

        // Fetch top 10 recommended recipes and map with similarity scores
        const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
        const topRecommendations = await Recipes.find({
            RecipeId: { $in: recommendations.slice(0,6).map(rec => rec.recipeId) }
        }).exec();

        // Map recommendations with recipe details and similarity scores
        const sortedRecommendations = topRecommendations.map(recipe => {
            const rec = recommendations.find(r => r.recipeId === recipe.RecipeId);
            return { recipe, similarityScore: rec.similarityScore };
        });

        // Sort the final recommendations by similarity score
        sortedRecommendations.sort((a, b) => b.similarityScore - a.similarityScore);

        return sortedRecommendations;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
};




module.exports = {
    recommendRecipes,
};
