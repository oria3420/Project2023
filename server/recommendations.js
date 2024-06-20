const globals = require('../client/src/common/tablesNames');
const Collection = require('./models/collection.model');
const TABLE_NAMES = globals.TABLE_NAMES;

const extractFeatures = async (recipe) => {
    const categories = Array.isArray(recipe.RecipeCategory) ? recipe.RecipeCategory : [recipe.RecipeCategory];
    const tags = await aggregateTags(recipe.RecipeId);
    return {
        categories,
        tags,
    };
};

const aggregateTags = async (recipeId) => {
    const tagCollections = [
        'allergy_categories',
        'cooking_type_categories',
        'difficulty_categories',
        'flavor_categories',
        'food_categories',
        'health_categories',
        'holiday_categories',
        'kitchen_style_categories',
        'kosher_categories',
        'meal_type_categories',
        'time_categories',
    ];

    const tags = [];
    for (const collection of tagCollections) {
        const RecipeTagCollection = Collection.getModel(`recipe_${collection}`);
        const TagCollection = Collection.getModel(collection);

        const tagsForRecipe = await RecipeTagCollection.find({ recipe_ID: recipeId });
        for (const tag of tagsForRecipe) {
            const category = await TagCollection.findOne({ id: tag.category_ID });
            if (category) {
                tags.push(category[collection.slice(0, -11)]); // Extract tag value from collection name
            }
        }
    }

    // console.log("tags", tags);
    return tags;
};

const buildCategoryVocabulary = async () => {
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
    const allRecipes = await Recipes.find();
    const categorySet = new Set();

    allRecipes.forEach(recipe => {
        categorySet.add(recipe.RecipeCategory);
    });

    return Array.from(categorySet);
};

const tagCategories = Object.keys(TABLE_NAMES)
    .filter(name => name.endsWith('CATEGORIES') && !name.startsWith('RECIPE'))
    .map(name => TABLE_NAMES[name].toLowerCase())
    .sort(); // Sort alphabetically

const buildTagVocabulary = async () => {

    const tagSet = new Set();
    for (const collection of tagCategories) {
        const TagCollection = Collection.getModel(collection);
        const tags = await TagCollection.distinct(collection.slice(0, -11)); // Extract tag field name

        tags.forEach(tag => {
            tagSet.add(tag);
        });
    }

    return Array.from(tagSet);
};

const vectorize = (categories, tags, categoryVocabulary, tagVocabulary) => {

    const vector = new Array(categoryVocabulary.length + tagVocabulary.length).fill(0);

    categories.forEach(category => {
        const index = categoryVocabulary.indexOf(category);
        if (index !== -1) {
            vector[index] = 1;
        }
    });

    tags.forEach(tag => {
        const index = tagVocabulary.indexOf(tag);
        if (index !== -1) {
            vector[categoryVocabulary.length + index] = 1; // Offset by the length of category vocabulary
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
        tags: [],
    };

    for (const recipe of favoritedRecipes) {
        const features = await extractFeatures(recipe);
        userProfile.categories.push(...features.categories);
        userProfile.tags.push(...features.tags);
    }

    return userProfile;
};

const cosineSimilarity = (vec1, vec2) => {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitude1 * magnitude2);
};

const recommendRecipes = async (userId) => {
    const categoryVocabulary = await buildCategoryVocabulary();
    console.log("categoryVocabulary: ", categoryVocabulary.length, categoryVocabulary);

    const tagVocabulary = await buildTagVocabulary();
    console.log("tagVocabulary: ", tagVocabulary.length , tagVocabulary);

    const userProfile = await buildUserProfile(userId);
    console.log("userProfile:", userProfile);
    const userVector = vectorize(userProfile.categories, userProfile.tags, categoryVocabulary, tagVocabulary);
    console.log("userVector: ", userVector)
    
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
    const allRecipes = await Recipes.find();

    const recommendations = [];

    for (let i=0; i<2; i++) {
        const recipe = allRecipes[i];
        const { categories, tags } = await extractFeatures(recipe);
        const recipeVector = vectorize(categories, tags, categoryVocabulary, tagVocabulary);
        console.log("recipeVector: ", recipeVector)
        const similarityScore = cosineSimilarity(userVector, recipeVector);
        console.log("similarityScore:", similarityScore);
        recommendations.push({recipe , similarityScore });
    }

    // console.log(recommendations)
    return recommendations.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
};

module.exports = {
    recommendRecipes,
};
