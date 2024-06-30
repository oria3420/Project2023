const globals = require('../client/src/common/tablesNames');
const Collection = require('./models/collection.model');
const TABLE_NAMES = globals.TABLE_NAMES;

const tagCategories = Object.keys(TABLE_NAMES)
    .filter(name => name.endsWith('CATEGORIES') && !name.startsWith('RECIPE'))
    .map(name => TABLE_NAMES[name].toLowerCase())
    .sort(); // Sort alphabetically

// Map collection names to their respective tag field names
const collectionToTagField = {
    allergy_categories: 'allergy',
    cooking_type_categories: 'cookingtype',
    difficulty_categories: 'difficulty',
    flavor_categories: 'flavor',
    food_categories: 'food',
    health_categories: 'health',
    holiday_categories: 'holiday',
    kitchen_style_categories: 'kitchen',
    kosher_categories: 'kosher',
    meal_type_categories: 'mealType',
    time_categories: 'time'
    // Add more mappings as needed for other collections
};

const extractFeatures = async (recipe) => {
    const categories = [recipe.RecipeCategory];

    // Aggregate tags directly within extractFeatures
    const tags = new Set();


    // Fetch tags concurrently for all collections
    const tagPromises = tagCategories.map(async (collection) => {
        const RecipeTagCollection = Collection.getModel(`recipe_${collection}`);
        const TagCollection = Collection.getModel(collection);
        
        // Fetch tags for the recipe from RecipeTagCollection
        const tagsForRecipe = await RecipeTagCollection.find({ recipe_ID: recipe.RecipeId });

        // Fetch category details concurrently
        const categoryIds = tagsForRecipe.map(tag => tag.category_ID);
        const categories = await TagCollection.find({ id: { $in: categoryIds } });

        // Extract tags and filter out empty values
        return categories.map(category => category[collectionToTagField[collection]]).filter(Boolean);
    });

    try {
        const allTags = await Promise.all(tagPromises);
        allTags.flat().forEach(tag => tags.add(tag));
    } catch (error) {
        console.error('Error aggregating tags:', error);
        // Handle error as needed
    }
    console.log(tags)

    return { categories, tags: Array.from(new Set(['easy', 'vegetable', 'parve', '30-60 min'])) };
};



const buildUserProfile = async (userId) => {
    console.log("start of buildUserProfile");

    const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);

    const favorites = await Favorites.find({ user_id: userId });
    const recipeIds = favorites.map(favorite => favorite.recipe_id);

    const favoritedRecipes = await Recipes.find({ RecipeId: { $in: recipeIds } });

    const featurePromises = favoritedRecipes.map(recipe => extractFeatures(recipe));
    const featuresArray = await Promise.all(featurePromises);

    const userProfile = {
        categories: [],
        tags: [],
    };

    featuresArray.forEach(features => {
        userProfile.categories.push(...features.categories);
        userProfile.tags.push(...features.tags);
    });

    console.log("end of buildUserProfile");
    return userProfile;
};

const buildCategoryVocabulary = async () => {
    console.log("start of buildCategoryVocabulary");
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
    const uniqueCategories = await Recipes.distinct("RecipeCategory");
    console.log("end of buildCategoryVocabulary");
    return uniqueCategories;
};

const buildTagVocabulary = async () => {
    console.log("start of buildTagVocabulary");

    const tagSet = new Set();

    // Using Promise.allSettled for parallel execution
    await Promise.allSettled(tagCategories.map(async (collection) => {
        const TagCollection = Collection.getModel(collection);
        const tagFieldName = collectionToTagField[collection];

        if (!tagFieldName) {
            console.error(`No tag field mapping found for collection ${collection}`);
            return [];
        }

        const tags = await TagCollection.distinct(tagFieldName);
        
        // Add tags to set directly
        tags.forEach(tag => tagSet.add(tag));
    }));

    console.log("end of buildTagVocabulary");
    
    // Convert Set to Array and return
    return Array.from(tagSet);
};


const vectorize = (categories, tags, categoryVocabulary, tagVocabulary) => {
    console.log("start of vectorize");
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
            vector[categoryVocabulary.length + index] = 1;
        }
    });

    console.log("end of vectorize");
    return vector;
};

const cosineSimilarity = (vec1, vec2) => {
    console.log("start of cosineSimilarity");
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    console.log("end of cosineSimilarity");
    return dotProduct / (magnitude1 * magnitude2);
};

const recommendRecipes = async (userId) => {
    const [categoryVocabulary, tagVocabulary, userProfile, Recipes] = await Promise.all([
        buildCategoryVocabulary(),
        buildTagVocabulary(),
        buildUserProfile(userId),
        Collection.getModel(TABLE_NAMES.RECIPES)
    ]);

    // console.log("categoryVocabulary: ", categoryVocabulary.length);
    // console.log("tagVocabulary: ", tagVocabulary.length);
    // console.log("userProfile: ", userProfile);


    const userVector = vectorize(userProfile.categories, userProfile.tags, categoryVocabulary, tagVocabulary);

    const allRecipes = await Recipes.find();
    const recommendations = [];

    const processRecipes = allRecipes.slice(0,1).map(async (recipe) => {
        const { categories, tags } = await extractFeatures(recipe);
        const recipeVector = vectorize(categories, tags, categoryVocabulary, tagVocabulary);

        const similarityScore = cosineSimilarity(userVector, recipeVector);

        return { recipe, similarityScore };
    });

    const results = await Promise.all(processRecipes);
    console.log("*****************************");

    return results.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
};

module.exports = {
    recommendRecipes,
};
