const mongoose = require('mongoose');
const Collection = require('../models/collection.model'); // Assuming you have a collection model
const GlobalVocabularies = require('../models/globalVocabularies.model');
const RecipesVectors = require('../models/recipesVectors.model');
const globals = require('../../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;

const {
    extractFeatures,
    vectorize
} = require('./utils'); // Import from utils


const initRecipeVectors = async () => {
    try {

        const [categoryVocabulary, tagVocabulary] = await Promise.all([
            GlobalVocabularies.findOne({ type: 'category' }).select('vocabulary'),
            GlobalVocabularies.findOne({ type: 'tag' }).select('vocabulary')
        ]);

        const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);

        const allRecipes = await Recipes.find();


        const updateOperations = allRecipes.map(async (recipe) => {
            const { categories, tags } = await extractFeatures(recipe);


            const vector = vectorize(categories, tags, categoryVocabulary.vocabulary, tagVocabulary.vocabulary);



            // Update or insert into RecipesVectors collection
            await RecipesVectors.findOneAndUpdate(
                { recipeId: String(recipe.RecipeId) }, // Ensure RecipeId is treated as string for MongoDB
                { vector, updatedAt: new Date() },
                { upsert: true }
            );
        });

        await Promise.all(updateOperations);
        console.log('Recipe vectors initialized successfully!');
    } catch (error) {
        console.error('Error initializing recipe vectors:', error);
    } finally {
        mongoose.disconnect(); // Disconnect mongoose connection when done
    }
};

// Run the initialization function
initRecipeVectors();
