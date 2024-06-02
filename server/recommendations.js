
const globals = require('../client/src/common/tablesNames');
const Collection = require('./models/collection.model');
const TABLE_NAMES = globals.TABLE_NAMES;

const extractFeatures = (recipe) => {
    return {
        categories: recipe.RecipeCategory,
    };
};

const buildVocabulary = async () => {
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
    const allRecipes = await Recipes.find();
    const categorySet = new Set();

    allRecipes.forEach(recipe => {
        categorySet.add(recipe.RecipeCategory);
    });

    return Array.from(categorySet);
};

const vectorize = (categories, vocabulary) => {
    const vector = new Array(vocabulary.length).fill(0);
    categories.forEach(category => {
        const index = vocabulary.indexOf(category);
        if (index !== -1) {
            vector[index] = 1;
        }
    });
    return vector;
};

const buildUserProfile = async (userId) => {
    const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);

    const favorites = await Favorites.find({ user_id: userId });
    const favoritedRecipes = await Recipes.find({ RecipeId: { $in: favorites.map(favorite => favorite.recipe_id) } });

    const userProfile = {
        categories: [],
    ץ};

    favoritedRecipes.forEach(recipe => {
        const features = extractFeatures(recipe);
        userProfile.categories.push(features.categories);
    });

    return userProfile;
};

const cosineSimilarity = (vec1, vec2) => {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
};

const recommendRecipes = async (userId) => {
    const vocabulary = await buildVocabulary();
    console.log("vocabulary: ", vocabulary)
    const userProfile = await buildUserProfile(userId);
    console.log("userProfile: ", userProfile)
    const userVector = vectorize(userProfile.categories, vocabulary);
    console.log("userVector: ", userVector)

    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
    const allRecipes = await Recipes.find();

    const recommendations = allRecipes.map(recipe => {
        const recipeVector = vectorize([recipe.RecipeCategory], vocabulary);
        console.log("recipeVector: ", recipeVector)
        const similarityScore = cosineSimilarity(userVector, recipeVector);
        console.log("similarityScore: ", similarityScore)
        return { recipe, similarityScore };
    });

    console.log(recommendations.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10))
    return recommendations.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
};

module.exports = {
    recommendRecipes,
};
