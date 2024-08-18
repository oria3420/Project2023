const express = require('express');
const router = express.Router();
const Collection = require('../models/collection.model');
const globals = require('../../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;
const { startScheduledTasks } = require('../recommendtion/scheduler')
const { recommendRecipes } = require('../recommendations');
const UsersProfile = require('../models/usersProfile.model');
const RecipesVectors = require('../models/recipesVectors.model');

const getActiveTagsAndCategories = (vector) => {
  return vector.filter(item => item.value === 1);
};


router.get('/user-recommendations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const Users = Collection.getModel(TABLE_NAMES.USERS);

    // Check if the user exists in the Users collection
    const userExists = await Users.exists({ email: userId });
    if (!userExists) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }
    const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
    // Fetch the user's profile and check for existence in one step
    const userProfile = await UsersProfile.findOne({ user_id: userId }).select('vector');
    const userFavorites = await Favorites.find({ user_id: userId }).select('recipe_id');

    if (!userProfile || userFavorites.length === 0) {
      return res.status(404).json({ error: 'User does not have a profile yet' });
    }

    const activeProfile = getActiveTagsAndCategories(userProfile.vector);

    const recommendations = await recommendRecipes(userId);
    console.log("recommendations: ", recommendations)
    // Fetch vectors for the top 3 recommended recipes
    const recipeIds = recommendations.slice(0, 3).map(rec => rec.recipe.RecipeId);
    const recipeVectors = await RecipesVectors.find({ recipeId: { $in: recipeIds } });

    // Add tags and categories to recommendations
    const recommendationsWithTags = recommendations.slice(0, 3).map(rec => {
      const recipeVector = recipeVectors.find(vec => vec.recipeId === rec.recipe.RecipeId);
      const activeTagsAndCategories = getActiveTagsAndCategories(recipeVector.vector);
      return {
        ...rec,
        recipe: {
          ...rec.recipe,
          tagsAndCategories: activeTagsAndCategories
        }
      };
    });
    console.log(recommendationsWithTags)
    res.json({ activeProfile, recommendations: recommendationsWithTags });
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});




router.get('/top-active-users', async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const Activity = Collection.getModel(TABLE_NAMES.ACTIVITIES);

  try {
    const topActiveUsers = await Activity.aggregate([
      { $match: { timestamp: { $gte: oneWeekAgo } } },
      { $group: { _id: "$userId", activityCount: { $sum: 1 } } },
      { $sort: { activityCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: TABLE_NAMES.USERS, // The collection to join with
          localField: "_id", // Field from the activities collection
          foreignField: "email", // Field from the users collection
          as: "userDetails" // Alias for the joined data
        }
      },
      { $unwind: "$userDetails" }, // Deconstruct the array
      { $project: { _id: 0, userId: "$_id", activityCount: 1, userName: "$userDetails.name" } }
    ]);

    res.json(topActiveUsers);
  } catch (error) {
    console.error('Error fetching top active users:', error);
    res.status(500).json({ message: 'Error fetching top active users' });
  }
});



router.get('/activity_summary', async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const Activity = Collection.getModel(TABLE_NAMES.ACTIVITIES);

  try {
    const activitySummary = await Activity.aggregate([
      { $match: { timestamp: { $gte: oneWeekAgo } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $project: { _id: 0, type: "$_id", count: 1 } }
    ]);

    res.json(activitySummary);
  } catch (error) {
    console.error('Error fetching activity summary:', error);
    res.status(500).json({ message: 'Error fetching activity summary' });
  }
});


// Function to calculate age from birthdate
const calculateAge = (birthDate) => {
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

// Endpoint to get user ages
router.get('/user-ages', async (req, res) => {
  try {
    const Users = Collection.getModel(TABLE_NAMES.USERS);
    const users = await Users.find({});
    const ageCounts = {};

    users.forEach(user => {
      const age = calculateAge(user.birthDate);
      if (ageCounts[age]) {
        ageCounts[age]++;
      } else {
        ageCounts[age] = 1;
      }
    });

    const ageData = Object.keys(ageCounts).map(age => ({
      age: Number(age),
      count: ageCounts[age]
    }));
    res.json(ageData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to get the current frequency
router.get('/current_frequency', async (req, res) => {
  try {
    const Setting = Collection.getModel(TABLE_NAMES.SETTINGS);
    const setting = await Setting.findOne({ key: 'calculation_frequency' });
    if (setting) {
      res.json({ frequency: setting.value });
    } else {
      res.status(404).json({ error: 'Frequency setting not found' });
    }
  } catch (error) {
    console.error('Error fetching current frequency:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/update_frequency', async (req, res) => {

  const { frequency } = req.body;

  // Validate frequency
  const validFrequencies = ['every-min', 'once-a-week', 'twice-a-week', 'everyday'];
  if (!validFrequencies.includes(frequency)) {
    return res.status(400).json({ error: 'Invalid frequency' });
  }

  try {
    const Setting = Collection.getModel(TABLE_NAMES.SETTINGS);
    // Update the frequency in the database
    await Setting.findOneAndUpdate({ key: 'calculation_frequency' }, { value: frequency }, { upsert: true });

    // Re-start the scheduled tasks
    await startScheduledTasks();

    // Respond with success
    res.json({ message: 'Frequency updated successfully' });
  } catch (error) {
    console.error('Error updating frequency:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
