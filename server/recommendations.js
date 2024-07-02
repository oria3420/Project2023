const globals = require('../client/src/common/tablesNames');
const Collection = require('./models/collection.model');
const TABLE_NAMES = globals.TABLE_NAMES;

const UsersProfile = require('./models/usersProfile.model');
const RecipesVectors = require('./models/recipesVectors.model');

const cosineSimilarity = (vec1, vec2) => { 
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i].value, 0); // Adjusted to access 'value' property in vec2
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val.value * val.value, 0)); // Adjusted to access 'value' property in vec2
    return dotProduct / (magnitude1 * magnitude2);
};

const recommendRecipes = async (userId) => {
    try {
        // Fetch user profile vector and all recipe vectors in parallel
        const [userProfile, allRecipes] = await Promise.all([
            UsersProfile.findOne({ user_id: userId }).select('vector'),
            RecipesVectors.find({}, { recipeId: 1, vector: 1 })
        ]);

        if (!userProfile) {
            throw new Error(`User profile not found for user ID ${userId}`);
        }

        const userVector = userProfile.vector.map(entry => entry.value);

        // Compute similarity scores in parallel
        const similarityPromises = allRecipes.map(async (recipe) => {
            const similarityScore = cosineSimilarity(userVector, recipe.vector);
            return { recipeId: recipe.recipeId, similarityScore };
        });

        // Wait for all similarity calculations to complete
        const recommendations = await Promise.all(similarityPromises);

        // Sort recommendations by similarity score
        recommendations.sort((a, b) => b.similarityScore - a.similarityScore);

        // Fetch top 10 recommended recipes and map with similarity scores
        const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
        const topRecommendations = await Recipes.find({ RecipeId: { $in: recommendations.slice(0, 10).map(rec => rec.recipeId) } }).exec();

        // Map recommendations with recipe details and similarity scores
        return topRecommendations.map(recipe => {
            const rec = recommendations.find(r => r.recipeId === recipe.RecipeId);
            return { recipe, similarityScore: rec.similarityScore };
        });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
};


module.exports = {
    recommendRecipes,
};
