const globals = require('../../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;
const axios = require('axios'); // Import Axios for making HTTP requests
const Collection = require('../models/collection.model');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const Users = Collection.getModel(TABLE_NAMES.USERS);
const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);

async function generateFavorites() {
  try {
    // Fetch all users except the first 5 real users
    const allUsers = await Users.find().exec(); 
    
    if (allUsers.length <= 5) {
      console.log('Not enough users to proceed.');
      return;
    }
    
    // Exclude the first 5 users and get the last 250 users
    const users = allUsers.slice(-250); // Get the last 250 users
    
    // Retrieve all recipes or a subset of them
    const recipes = await Recipes.find().exec();
    
    if (users.length === 0 || recipes.length === 0) {
      console.log('No users or recipes found.');
      return;
    }
    
    // Generate favorite recipes for each user
    for (const user of users) {
      // Determine a random number of recipes to add as favorites (e.g., 1 to 10)
      const numberOfFavorites = Math.floor(Math.random() * 10) + 1;
      // Track selected recipe IDs to avoid duplicates
      const selectedRecipeIds = new Set();

      for (let i = 0; i < numberOfFavorites; i++) {
        // Randomly select a recipe
        let randomRecipe;
        do {
          randomRecipe = recipes[Math.floor(Math.random() * recipes.length)];
        } while (selectedRecipeIds.has(randomRecipe.RecipeId));

        selectedRecipeIds.add(randomRecipe.RecipeId);
        console.log("selectedRecipeIds: ", selectedRecipeIds)
        // Check if the favorite already exists for this user and recipe
        const existingFavorite = await Favorites.findOne({
          user_id: "user.email",
          recipe_id: randomRecipe.RecipeId,
        }).exec();

        if (!existingFavorite) {
          // If the favorite doesn't exist, add it using the existing endpoint
          await axios.post(`http://localhost:1337/api/favorites/${randomRecipe.RecipeId}/${user.email}`);
          console.log(`Added recipe ${randomRecipe.RecipeId} to user ${user.email}'s favorites`);
        } else {
          console.log(`User ${user.email} already has recipe ${randomRecipe.RecipeId} as a favorite`);
        }
      }
    }

    console.log('Favorites generated for the last 250 users.');
  } catch (error) {
    console.error('Error generating favorites:', error);
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

    await generateFavorites(); // Wait for this to finish

  } catch (error) {
    console.error('Error during script execution:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Execute the main function
main().catch(err => console.error('Error in main function:', err));
