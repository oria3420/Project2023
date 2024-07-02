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
        // Fetch user profile vector
        const userProfile = await UsersProfile.findOne({ user_id: userId }).select('vector');
        if (!userProfile) {
            throw new Error(`User profile not found for user ID ${userId}`);
        }


        const userVector = userProfile.vector.map(entry => entry.value);
        console.log("userVector: ", userVector)

        // Fetch all recipe vectors with recipeId and vector fields
        const allRecipes = await RecipesVectors.find({}, { recipeId: 1, vector: 1 });

        if (!allRecipes.length) {
            throw new Error('No recipe vectors found');
        }

        // Compute similarity scores
        const recommendations = allRecipes.map(recipe => {
            const recipeVector = recipe.vector;
            console.log("recipeVector: ", recipeVector)

            const similarityScore = cosineSimilarity(userVector, recipeVector);
            console.log("similarityScore: ", similarityScore)
            return { recipeId: recipe.recipeId, similarityScore };
        });

        // Sort recommendations by similarity score
        recommendations.sort((a, b) => b.similarityScore - a.similarityScore);

        // Fetch top 10 recommended recipes
        const topRecommendations = recommendations.slice(0, 10);
        const recipeIds = topRecommendations.map(rec => rec.recipeId);

        console.log("recipeIds: ", recipeIds)

        const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
        const recommendedRecipes = await Recipes.find({ RecipeId: { $in: recipeIds } }).exec();

        console.log("recommendedRecipes:", recommendedRecipes);

        return recommendedRecipes.map(recipe => {
            const rec = topRecommendations.find(r => r.recipeId === recipe.RecipeId);
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
