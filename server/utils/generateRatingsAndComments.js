const globals = require('../../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;
const Collection = require('../models/collection.model');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const Users = Collection.getModel(TABLE_NAMES.USERS);
const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
const Ratings = Collection.getModel(TABLE_NAMES.RATINGS);
const Comments = Collection.getModel(TABLE_NAMES.COMMENTS);

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

async function logActivity(userId, type, details = {}, timestamp = new Date()) {
    try {
        const newActivity = new Activity({
            userId,
            type,
            details,
            timestamp, // Use the provided timestamp instead of the default Date.now()
        });
        await newActivity.save();
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

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

function getRandomDateWithinLastYear() {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    return new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
}

async function addRatingAndComment(user, recipe, rating, comment, randomDate) {
    try {
        // Add or update rating
        let userRating = await Ratings.findOne({ recipe_id: recipe.RecipeId, user_id: user.email });

        if (userRating) {
            await Ratings.updateOne(
                { recipe_id: recipe.RecipeId, user_id: user.email },
                { $set: { rating: rating, date: randomDate } }
            );
        } else {
            userRating = await Ratings.create({
                recipe_id: recipe.RecipeId,
                user_id: user.email,
                rating: rating,
                date: randomDate
            });
        }

        // Calculate the new average rating for the recipe
        const allRatings = await Ratings.find({ recipe_id: recipe.RecipeId });
        const totalRatings = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
        const reviewCount = allRatings.length;
        const averageRating = totalRatings / reviewCount;

        // Update the recipe's overall rating and review count
        await Recipes.updateOne(
            { RecipeId: recipe.RecipeId },
            {
                $set: {
                    AggregatedRating: averageRating,
                    ReviewCount: reviewCount,
                }
            }
        );

        await logActivity(user.email, 'rating', { recipeId: recipe.RecipeId, rating: rating }, randomDate);

        // Optionally add comment
        if (comment) {
            const commentImageDetails = null;  // Assuming no image in this scenario

            const newComment = await Comments.create({
                recipe_id: recipe.RecipeId,
                user_id: user.email,
                comment_text: comment,
                comment_date: randomDate,
                comment_image: commentImageDetails,
            });

            await logActivity(user.email, 'comment', { recipeId: recipe.RecipeId, comment: comment }, randomDate);
        }

    } catch (error) {
        console.error('Error adding rating or comment:', error);
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
            const userFavorites = await Favorites.find({ user_id: user.email }).exec();
            const favoritedRecipeIds = userFavorites.map(fav => fav.recipe_id);

            const numberOfRatings = Math.floor(Math.random() * 10) + 1; // 1 to 10 ratings
            const selectedRecipeIds = new Set();

            let ratingsGenerated = 0;
            for (const recipeId of favoritedRecipeIds) {
                if (ratingsGenerated >= numberOfRatings) break;

                const recipe = recipes.find(r => r.RecipeId === recipeId);
                if (!recipe) continue;

                selectedRecipeIds.add(recipeId);

                const rating = Math.floor(Math.random() * 2) + 4; // High rating (4-5 stars)
                const comment = generateComment(rating);
                const randomDate = getRandomDateWithinLastYear();

                await addRatingAndComment(user, recipe, rating, comment, randomDate);

                ratingsGenerated++;
            }

            for (let i = ratingsGenerated; i < numberOfRatings; i++) {
                let randomRecipe;
                do {
                    randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
                } while (selectedRecipeIds.has(randomRecipe?.RecipeId) || !randomRecipe);

                if (!randomRecipe) continue;

                selectedRecipeIds.add(randomRecipe.RecipeId);

                const rating = Math.floor(Math.random() * 5) + 1; // Random rating (1-5 stars)
                const comment = generateComment(rating);
                const randomDate = getRandomDateWithinLastYear();

                await addRatingAndComment(user, randomRecipe, rating, comment, randomDate);
            }
            console.log('Ratings and comments generated for ', user.email);
        }

        console.log('Ratings and comments generated for the last 250 users.');
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

        await generateRatingsAndComments();

    } catch (error) {
        console.error('Error during script execution:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
    }
};

// Execute the main function
main().catch(err => console.error('Error in main function:', err));
