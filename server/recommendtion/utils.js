// utils.js
const Collection = require('../models/collection.model'); // Assuming you have a collection model
const globals = require('../../client/src/common/tablesNames');
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
    kitchen_style_categories: 'kitchen',
    kosher_categories: 'kosher',
    meal_type_categories: 'mealType',
    time_categories: 'time'
    // Add more mappings as needed for other collections
};

const extractFeatures = async (recipe) => {
    const categories = [recipe.RecipeCategory]; // Assuming RecipeCategory is a single category
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

const vectorize = (categories, tags, categoryVocabulary, tagVocabulary) => {
    const vector = new Array(categoryVocabulary.length + tagVocabulary.length).fill(0);

    categories.forEach(category => {
        const index = categoryVocabulary.indexOf(category);
        if (index !== -1) {
            vector[index] = { value: 1, type: 'category', name: category };
        }
    });

    tags.forEach(tag => {
        const index = tagVocabulary.indexOf(tag);
        if (index !== -1) {
            vector[categoryVocabulary.length + index] = { value: 1, type: 'tag', name: tag };
        }
    });

    // Fill the rest of the vector with zeros
    for (let i = 0; i < categoryVocabulary.length + tagVocabulary.length; i++) {
        if (!vector[i]) {
            const type = i < categoryVocabulary.length ? 'category' : 'tag';
            const name = type === 'category' ? categoryVocabulary[i] : tagVocabulary[i - categoryVocabulary.length];
            vector[i] = { value: 0, type, name };
        }
    }

    return vector;
};

module.exports = {
    tagCategories,
    collectionToTagField,
    extractFeatures,
    aggregateTags,
    vectorize
};
