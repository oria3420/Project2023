const GlobalVocabularies = require('../models/globalVocabularies.model');
const Collection = require('../models/collection.model');
const globals = require('../../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;
const { tagCategories, collectionToTagField } = require('./utils');


const buildCategoryVocabulary = async () => {
    // console.log("Start building category vocabulary");
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
    const uniqueCategories = await Recipes.distinct("RecipeCategory");
    // console.log("End building category vocabulary");
    return uniqueCategories;
};

const buildTagVocabulary = async () => {
    // console.log("Start building tag vocabulary");
    const tagSet = new Set();

    await Promise.allSettled(tagCategories.map(async (collection) => {
        const TagCollection = Collection.getModel(collection);
        const tagFieldName = collectionToTagField[collection];

        if (!tagFieldName) {
            console.error(`No tag field mapping found for collection ${collection}`);
            return [];
        }

        const tags = await TagCollection.distinct(tagFieldName);
        tags.forEach(tag => tagSet.add(tag));
    }));

    return Array.from(tagSet);
};

const initGlobalVocabularies = async () => {

    try {
        console.log('Attempting to initialize global vocabularies...');
        // Build category vocabulary
        const categoryVocabulary = await buildCategoryVocabulary();

        // Build tag vocabulary
        const tagVocabulary = await buildTagVocabulary();

        // Save or update category vocabulary
        await GlobalVocabularies.findOneAndUpdate(
            { type: 'category' },
            { vocabulary: categoryVocabulary, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        // Save or update tag vocabulary
        await GlobalVocabularies.findOneAndUpdate(
            { type: 'tag' },
            { vocabulary: tagVocabulary, updatedAt: new Date() },
            { upsert: true, new: true }
        );

        console.log('Global vocabularies updated successfully');
    } catch (error) {
        console.error('Error initializing global vocabularies:', error);
    }
};

module.exports = initGlobalVocabularies;