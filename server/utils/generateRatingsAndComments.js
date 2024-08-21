const globals = require('../../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;
const axios = require('axios'); // Import Axios for making HTTP requests
const Collection = require('../models/collection.model');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const Users = Collection.getModel(TABLE_NAMES.USERS);
const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);

const goodComments = [
    "This recipe was amazing!",
    "I loved this dish!",
    "The flavor was spot on.",
    "Everyone at the table enjoyed it.",
    "The best recipe I've tried in a while!",
    "This dish was a hit with everyone."
];

const neutralComments = [
    "It was okay, but I've had better.",
    "The recipe was fine.",
    "I might make this again with some changes.",
    "It was decent, nothing special.",
    "Not bad, but not great either.",
    "It was alright, nothing to write home about."
];

const notGoodComments = [
    "I didn't like this recipe.",
    "The dish was disappointing.",
    "It didn't turn out well.",
    "I won't be making this again.",
    "The recipe wasn't to my taste.",
    "Unfortunately, this didn't work for me."
];

function generateComment(rating) {
    let comment;
    if (rating >= 4) {
        comment = goodComments[Math.floor(Math.random() * goodComments.length)];
    } else if (rating <= 2) {
        comment = notGoodComments[Math.floor(Math.random() * notGoodComments.length)];
    } else {
        comment = neutralComments[Math.floor(Math.random() * neutralComments.length)];
    }

    return comment;
}

async function addRatingAndCommentViaAPI(user, recipe, rating, comment) {
    try {
        // Add or update rating via API
        console.log("******* recipe id:", recipe.RecipeId, "******")
        await axios.post('http://localhost:1337/api/recipes/update_rating', {
            user_id: user.email,
            recipe_id: recipe.RecipeId,
            rating,
        });

        console.log(`rating`);

        // Optionally add comment via API
        if (comment) {
            await axios.post('http://localhost:1337/api/recipes/new_comment', {
                user_id: user.email,
                recipe_id: recipe.RecipeId,
                comment_text: comment,
                user_name: user.name, // Assuming user.name is available
            });

            console.log(`comment`);
        }
    } catch (error) {
        console.error('Error adding rating or comment via API:', error);
    }
}

async function generateRatingsAndComments() {
    try {
        const allUsers = await Users.find().exec();

        if (allUsers.length <= 5) {
            console.log('Not enough users to proceed.');
            return;
        }

        const users = allUsers.slice(-250); // Get the last 250 users

        const recipes = await Recipes.find().exec();

        if (users.length === 0 || recipes.length === 0) {
            console.log('No users or recipes found.');
            return;
        }

        for (const user of users) {
            // Get user's favorites
            const userFavorites = await Favorites.find({ user_id: user.email }).exec();
            const favoritedRecipeIds = userFavorites.map(fav => fav.recipe_id);

            const numberOfRatings = Math.floor(Math.random() * 10) + 1; // 1 to 10 ratings
            const selectedRecipeIds = new Set();

            // Rate and comment on favorited recipes with positive feedback
            let ratingsGenerated = 0;
            for (const recipeId of favoritedRecipeIds) {
                if (ratingsGenerated >= numberOfRatings) break;

                const recipe = recipes.find(r => r.RecipeId === recipeId);
                if (!recipe) {
                    console.error(`Recipe with ID ${recipeId} not found.`);
                    continue;
                }

                selectedRecipeIds.add(recipeId);

                const rating = Math.floor(Math.random() * 2) + 4; // High rating (4-5 stars)
                const comment = generateComment(rating);

                await addRatingAndCommentViaAPI(user, recipe, rating, comment);

                ratingsGenerated++;
            }

            // Continue with non-favorited recipes if more ratings/comments are needed
            for (let i = ratingsGenerated; i < numberOfRatings; i++) {
                let randomRecipe;
                do {
                    randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
                } while (selectedRecipeIds.has(randomRecipe?.RecipeId) || !randomRecipe);

                if (!randomRecipe) {
                    console.error('Random recipe selection failed.');
                    continue;
                }

                selectedRecipeIds.add(randomRecipe.RecipeId);

                const rating = Math.floor(Math.random() * 5) + 1; // Random rating (1-5 stars)
                const comment = generateComment(rating);

                await addRatingAndCommentViaAPI(user, randomRecipe, rating, comment);
            }
            console.log('Ratings and comments generated for ', user.email );
        }

        console.log('Ratings and comments generated for the last 250 users.'); // Ensure this is only logged once
    } catch (error) {
        console.error('Error generating ratings and comments:', error);
    }
}

// Run the script
const main = async () => {
    try {
        await mongoose.connect('mongodb+srv://shirataitel:shirataitel123@project2023.wtpkihw.mongodb.net/project2023', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected successfully');

        await generateRatingsAndComments(); // Ensure this is awaited

    } catch (error) {
        console.error('Error during script execution:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

// Execute the main function once
main().catch(err => console.error('Error in main function:', err));
