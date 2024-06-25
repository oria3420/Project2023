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
    const categories = Array.isArray(recipe.RecipeCategory) ? recipe.RecipeCategory : [recipe.RecipeCategory];
    const tags = await aggregateTags(recipe.RecipeId);
    return { categories, tags };
};

const aggregateTags = async (recipeId) => {
    const tags = [];

    // Fetch tags concurrently for all collections
    const tagPromises = tagCategories.map(async (collection) => {
        const RecipeTagCollection = Collection.getModel(`recipe_${collection}`);
        const TagCollection = Collection.getModel(collection);
        const tagsForRecipe = await RecipeTagCollection.find({ recipe_ID: recipeId });

        // Fetch category details concurrently
        const categoryPromises = tagsForRecipe.map(async (tag) => {
            const tagFieldName = collectionToTagField[collection];
            const category = await TagCollection.findOne({ id: tag.category_ID });

            if (category && category[tagFieldName]) {
                return category[tagFieldName];
            }
        });

        const resolvedCategories = await Promise.all(categoryPromises);
        return resolvedCategories.filter(Boolean);  // Remove undefined values
    });

    const allTags = await Promise.all(tagPromises);
    allTags.flat().forEach(tag => tags.push(tag));  // Flatten the array and add tags

    return tags;
};

// const extractFeatures = async (recipe) => {
//     const categories = Array.isArray(recipe.RecipeCategory) ? recipe.RecipeCategory : [recipe.RecipeCategory];
//     const tags = await aggregateTags(recipe.RecipeId);
//     return {
//         categories,
//         tags,
//     };
// };

// const aggregateTags = async (recipeId) => {
//     const tags = [];

//     for (const collection of tagCategories) {
//         const RecipeTagCollection = Collection.getModel(`recipe_${collection}`);
//         const TagCollection = Collection.getModel(collection);

//         const tagsForRecipe = await RecipeTagCollection.find({ recipe_ID: recipeId });

//         for (const tag of tagsForRecipe) {
//             const tagFieldName = collectionToTagField[collection];
//             const category = await TagCollection.findOne({ id: tag.category_ID });

//             if (category && category[tagFieldName]) {
//                 tags.push(category[tagFieldName]);
//             }
//         }
//     }

//     return tags;
// };

const buildUserProfile = async (userId) => {
    console.log("start of buildUserProfile");

    const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);

    // Fetch favorites first
    const favorites = await Favorites.find({ user_id: userId });
    const recipeIds = favorites.map(favorite => favorite.recipe_id);

    // Fetch favorited recipes using the recipe IDs from favorites
    const favoritedRecipes = await Recipes.find({ RecipeId: { $in: recipeIds } });

    // Extract features concurrently
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
    console.log("start of buildCategoryVocabulary")
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
    // Use distinct to get unique RecipeCategory values
    const uniqueCategories = await Recipes.distinct("RecipeCategory");

    console.log("end of buildCategoryVocabulary")
    return uniqueCategories;
};




const buildTagVocabulary = async () => {
    console.log("start of buildTagVocabulary")
    const tagSet = new Set();

    for (const collection of tagCategories) {
        const TagCollection = Collection.getModel(collection);

        // Get the corresponding tag field name for this collection
        const tagFieldName = collectionToTagField[collection];

        if (!tagFieldName) {
            console.error(`No tag field mapping found for collection ${collection}`);
            continue; // Skip to the next collection
        }

        // Fetch distinct tags from the identified field
        const tags = await TagCollection.distinct(tagFieldName);

        tags.forEach(tag => {
            tagSet.add(tag);
        });
    }

    console.log("end of buildTagVocabulary")
    return Array.from(tagSet);
};



const vectorize = (categories, tags, categoryVocabulary, tagVocabulary) => {
    console.log("start of vectorize")
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

    console.log("end of vectorize")
    return vector;
};

// const buildUserProfile = async (userId) => {
//     console.log("start of buildUserProfile")
//     const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
//     const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);

//     const favorites = await Favorites.find({ user_id: userId });
//     const favoritedRecipes = await Recipes.find({ RecipeId: { $in: favorites.map(favorite => favorite.recipe_id) } });

//     const userProfile = {
//         categories: [],
//         tags: [],
//     };

//     for (const recipe of favoritedRecipes) {
//         const features = await extractFeatures(recipe);
//         userProfile.categories.push(...features.categories);
//         userProfile.tags.push(...features.tags);
//     }

    
//     console.log("end of buildUserProfile")
//     return userProfile;
// };

const cosineSimilarity = (vec1, vec2) => {
    console.log("start of cosineSimilarity")
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    console.log("end of cosineSimilarity")
    return dotProduct / (magnitude1 * magnitude2);
};


const recommendRecipes = async (userId) => {
    const [categoryVocabulary, tagVocabulary, userProfile, Recipes] = await Promise.all([
        buildCategoryVocabulary(),
        buildTagVocabulary(),
        buildUserProfile(userId),
        Collection.getModel(TABLE_NAMES.RECIPES)
    ]);

    console.log("categoryVocabulary: ", categoryVocabulary.length, categoryVocabulary);
    console.log("tagVocabulary: ", tagVocabulary.length, tagVocabulary);
    tagVocabulary.forEach(tag => console.log(tag));
    console.log("userProfile:", userProfile);

    const userVector = vectorize(userProfile.categories, userProfile.tags, categoryVocabulary, tagVocabulary);
    userVector.forEach(value => console.log(value));

    const allRecipes = await Recipes.find();
    const recommendations = [];

    // Use Promise.all to process the recipes in parallel
    const processRecipes = allRecipes.slice(0, 5).map(async (recipe) => {
        console.log("*****************************")
        console.log("recipe name: ", recipe.Name);

        const { categories, tags } = await extractFeatures(recipe);
        const recipeVector = vectorize(categories, tags, categoryVocabulary, tagVocabulary);
        recipeVector.forEach(value => console.log(value));

        const similarityScore = cosineSimilarity(userVector, recipeVector);
        console.log("similarityScore:", similarityScore);

        return { recipe, similarityScore };
    });

    // Wait for all recipe processing to complete
    const results = await Promise.all(processRecipes);

    // Sort the results by similarity score and return the top 10 recommendations
    return results.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 10);
};


module.exports = {
    recommendRecipes,
};
