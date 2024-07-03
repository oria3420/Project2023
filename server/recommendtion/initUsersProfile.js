const Collection = require('../models/collection.model'); // Assuming you have a collection model
const GlobalVocabularies = require('../models/globalVocabularies.model');
const UsersProfile = require('../models/usersProfile.model');
const globals = require('../../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;


const {
    extractFeatures,
    vectorize
} = require('./utils'); // Import from utils


const buildUserProfile = async (userId) => {
    const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
    const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);

    const favorites = await Favorites.find({ user_id: userId });
    const recipeIds = favorites.map(favorite => favorite.recipe_id);

    const favoritedRecipes = await Recipes.find({ RecipeId: { $in: recipeIds } });

    const featurePromises = favoritedRecipes.map(recipe => extractFeatures(recipe));
    const featuresArray = await Promise.all(featurePromises);

    const userProfile = {
        categories: new Set(),
        tags: new Set(),
    };

    featuresArray.forEach(features => {
        features.categories.forEach(category => userProfile.categories.add(category));
        features.tags.forEach(tag => userProfile.tags.add(tag));
    });

    return {
        categories: Array.from(userProfile.categories),
        tags: Array.from(userProfile.tags),
    };
};


const initUserProfile = async (userId, categoryVocabulary, tagVocabulary) => {
    const userProfile = await buildUserProfile(userId);

    const userVector = vectorize(userProfile.categories, userProfile.tags, categoryVocabulary, tagVocabulary);

    await UsersProfile.updateOne(
        { user_id: userId },
        { $set: { vector: userVector, updatedAt: new Date() } },
        { upsert: true } // Insert if not exists, update if exists
    );

};


const updateAllUserProfiles = async () => {
    try {
        console.log('Attempting to initialize users profiless...');
        const [categoryVocabulary, tagVocabulary] = await Promise.all([
            GlobalVocabularies.findOne({ type: 'category' }).select('vocabulary').exec().then(res => res.vocabulary).catch(err => {
                console.error('Error fetching category vocabulary:', err);
                throw err;
            }),
            GlobalVocabularies.findOne({ type: 'tag' }).select('vocabulary').exec().then(res => res.vocabulary).catch(err => {
                console.error('Error fetching tag vocabulary:', err);
                throw err;
            })
        ]);


        const Users = Collection.getModel(TABLE_NAMES.USERS);
        const allUsers = await Users.find({}, { _id: 0, email: 1 }); // Fetch all user IDs


        await Promise.all(allUsers.map(async (user) => {
            await initUserProfile(user.email, categoryVocabulary, tagVocabulary);
        }));

        console.log("All user profiles updated successfully");
    } catch (err) {
        console.error("Error updating user profiles:", err);
    }
};


module.exports = updateAllUserProfiles;