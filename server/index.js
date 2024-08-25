const globals = require('../client/src/common/tablesNames');
const TABLE_NAMES = globals.TABLE_NAMES;
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user.model');
const Collection = require('./models/collection.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const path = require('path');
const { constants } = require('buffer');
const { recommendRecipes } = require('./recommendtion/recommendations');
const cron = require('./recommendtion/scheduler'); // Import your scheduler script
const adminRoutes = require('./routes/adminRoutes'); // Adjust the path as needed
const { logActivity } = require('./utils/activityLogger');


mongoose.set('strictQuery', false);

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());




mongoose.connect('mongodb+srv://shirataitel:shirataitel123@project2023.wtpkihw.mongodb.net/project2023', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected successfully');
  cron.setMongooseConnection(mongoose.connection);

}).catch((err) => {
  console.error('MongoDB connection error:', err);
});


const connection = mongoose.connection;
let gfs;

connection.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: 'uploads'
  });
  console.log('GridFS initialized');
});

const storage = new GridFsStorage({
  url: 'mongodb+srv://shirataitel:shirataitel123@project2023.wtpkihw.mongodb.net/project2023',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'uploads'
    };
  }
});

const upload = multer({ storage });
app.use(cors());
app.use(express.json());


const addRecipeRoutes = require('./routes/addRecipeRoutes')(upload, gfs);
app.use('/api/addRecipe', addRecipeRoutes);


app.use('/api/admin', adminRoutes);

// Get recommendations for a user
app.get('/api/recommendations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const recommendations = await recommendRecipes(userId);
    // console.log(recommendations)
    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



app.get('/api/user_settings/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email: email }).select('birthDate district password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      birthDate: user.birthDate,
      district: user.district,
      password: user.password
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Serve static files
app.use('/api/comments/images', express.static(path.join(__dirname, 'uploads')));


app.get('/api/comments/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const readstream = gfs.openDownloadStream(ObjectId(filename));

  readstream.on('error', (error) => {
    console.error('Error retrieving image:', error);
    res.status(404).send('Image not found');
  });

  readstream.pipe(res);
});


app.post('/api/recipes/update_rating', async (req, res) => {
  const Ratings = Collection.getModel(TABLE_NAMES.RATINGS);
  const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
  // console.log(Recipes);

  try {
    const { rating, recipe_id, user_id } = req.body;
    const parsedRecipeId = parseInt(recipe_id, 10);
    const currentDate = new Date();

    // Check if the user has already rated this recipe
    let userRating = await Ratings.findOne({ recipe_id: parsedRecipeId, user_id: user_id });

    if (userRating) {
      // Update existing rating
      await Ratings.updateOne(
        { recipe_id: parsedRecipeId, user_id: user_id },
        { $set: { rating: rating, date: currentDate } }
      );

      // Fetch the updated rating
      userRating = await Ratings.findOne({ recipe_id: parsedRecipeId, user_id: user_id });
    } else {
      // Create a new rating
      userRating = await Ratings.create({
        recipe_id: parsedRecipeId,
        user_id: user_id,
        rating: rating,
        date: currentDate
      });
    }

    // Calculate the new average rating for the recipe
    const allRatings = await Ratings.find({ recipe_id: parsedRecipeId });
    const totalRatings = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const reviewCount = allRatings.length;
    const averageRating = totalRatings / reviewCount;

    // Update the recipe's overall rating and review count
    await Recipes.updateOne(
      { RecipeId: parsedRecipeId },
      {
        $set: {
          AggregatedRating: averageRating, // Update the aggregated rating
          ReviewCount: reviewCount, // Update the review count
        }
      }
    );

    await logActivity(user_id, 'rating', { recipeId: parsedRecipeId, rating: rating });

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      updatedRating: userRating,
      aggregatedRating: averageRating, // Include the updated aggregated rating
      reviewCount: reviewCount // Include the updated review count
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


app.post('/api/recipes/new_comment', upload.single('comment_image'), async (req, res) => {
  const Comments = Collection.getModel(TABLE_NAMES.COMMENTS);

  try {
    const { comment_text, recipe_id, user_id, user_name } = req.body;
    const parsedRecipeId = parseInt(recipe_id, 10);

    const commentImageDetails = req.file ? {
      filename: req.file.filename,
      fileId: req.file.id,
    } : null;

    const newComment = await Comments.create({
      recipe_id: parsedRecipeId,
      user_id: user_id,
      comment_text: comment_text,
      comment_date: new Date().toISOString(),
      comment_image: commentImageDetails,
    });

    await logActivity(user_id, 'comment', { recipeId: recipe_id, comment: comment_text });

    res.status(201).json({
      message: 'Comment added successfully',
      newComment: {
        comment_text: newComment.comment_text,
        comment_date: newComment.comment_date,
        user_name: user_name,
        comment_image: commentImageDetails,
      },
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/add_item_to_shopping_list/:userId', async (req, res) => {
  const ShoppingList = Collection.getModel(TABLE_NAMES.SHOPPING_LIST);
  const { userId } = req.params;
  const { items } = req.body;
  console.log("items: ", items);

  try {
    // Retrieve the current shopping list for the user
    let existingList = await ShoppingList.findOne({ userId });

    // If the user does not have a shopping list yet, initialize it with all items
    if (!existingList) {
      console.log("userId: ", userId);
      const itemsWithChecked = items.map(item => ({
        ...item,
        checked: false // Set checked field to false by default
      }));
      existingList = await ShoppingList.create({ userId, items: itemsWithChecked });
      console.log("existingList: ", existingList);
    } else {
      // Filter out items that already exist in the shopping list based on name
      const newItems = items.filter(newItem => {
        return !existingList.items.some(existingItem =>
          existingItem.name === newItem.name
        );
      }).map(item => ({
        ...item,
        checked: false // Set checked field to false by default
      }));

      // If there are new items to add, update the shopping list
      if (newItems.length > 0) {
        const result = await ShoppingList.findOneAndUpdate(
          { userId },
          { $addToSet: { items: { $each: newItems } } }, // Use $addToSet to avoid duplicates
          { new: true, upsert: true }
        );

        console.log("Updated shopping list:", result);
      }
    }

    res.status(200).json({ message: 'Shopping list updated successfully' });
  } catch (error) {
    console.error('Error saving shopping list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/shopping_list/:userId', async (req, res) => {
  const ShoppingList = Collection.getModel(TABLE_NAMES.SHOPPING_LIST);
  const userId = req.params.userId;

  try {
    const shoppingList = await ShoppingList.findOne({ userId });

    if (!shoppingList) {
      return res.status(200).json([]);
    }

    return res.status(200).json(shoppingList.items);
  } catch (err) {
    console.error('Error fetching shopping list:', err);
    return res.status(500).json({ status: 'false', message: 'Internal server error' });
  }
});

app.delete('/api/shopping_list/:userId/:itemName', async (req, res) => {
  const ShoppingList = Collection.getModel(TABLE_NAMES.SHOPPING_LIST);
  const { userId, itemName } = req.params;

  try {
    // Find the user's shopping list
    const result = await ShoppingList.findOneAndUpdate(
      { userId },
      { $pull: { items: { name: itemName } } }, // Use $pull to remove the item by name
      { new: true }
    );

    if (result) {
      console.log(`Item ${itemName} removed from user ${userId}'s shopping list.`);
      res.status(200).json({ message: 'Item removed successfully', shoppingList: result });
    } else {
      res.status(404).json({ error: 'Shopping list not found' });
    }
  } catch (error) {
    console.error('Error removing item from shopping list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/delete_all_shopping_list/:userId', async (req, res) => {
  const ShoppingList = Collection.getModel(TABLE_NAMES.SHOPPING_LIST);
  const { userId } = req.params;

  try {
    const result = await ShoppingList.findOneAndDelete({ userId });

    if (result) {
      console.log(`User ${userId}'s shopping list and document deleted.`);
      res.status(200).json({ message: 'User document deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting user document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/shopping_list_check/:userId/:itemName', async (req, res) => {
  const { userId, itemName } = req.params;
  const { checked } = req.body; // Expecting { checked: true/false }
  console.log("itemName: ", itemName, ". checked: ", checked);
  const ShoppingList = Collection.getModel(TABLE_NAMES.SHOPPING_LIST);

  try {
    // Use findOneAndUpdate to update the checked status of the specific item
    const result = await ShoppingList.findOneAndUpdate(
      { userId, "items.name": itemName },
      { $set: { "items.$.checked": checked } },
      { new: true }
    );

    if (result) {
      res.status(200).send('Item updated successfully');
    } else {
      res.status(404).send('Shopping list or item not found');
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Server error');
  }
});


app.get('/api/recipes/:id/comments', async (req, res) => {
  try {
    const Comments = Collection.getModel(TABLE_NAMES.COMMENTS);
    const Users = Collection.getModel(TABLE_NAMES.USERS);
    const Ratings = Collection.getModel(TABLE_NAMES.RATINGS);

    const recipeId = parseInt(req.params.id);
    const userId = req.query.user_id;

    const comments = await Comments.find({ recipe_id: recipeId });
    const userRating = await Ratings.findOne({ recipe_id: recipeId, user_id: userId });

    const commentsWithSelectedFields = await Promise.all(comments.map(async (comment) => {
      const user = await Users.findOne({ email: comment.user_id });
      const userName = user ? user.name : 'Unknown User';

      return {
        comment_text: comment.comment_text,
        comment_date: comment.comment_date,
        user_name: userName,
        comment_image: comment.comment_image,
      };
    }));

    // Return the comments and the user's rating
    res.status(200).json({
      comments: commentsWithSelectedFields,
      userRating: userRating ? userRating.rating : null,
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


app.get('/api/admin', (req, res) => {
  mongoose.connection.db.listCollections().toArray((err, collections) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else {
      const collectionNames = collections.map(collection => collection.name);
      res.status(200).json(collectionNames);
    }
  });
});


app.post('/api/register', async (req, res) => {
  try {
    console.log("in register")
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ error: 'Duplicate email' });
    }
    const newPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      gender: req.body.gender,
      birthDate: req.body.birthDate,
      district: req.body.district,
      password: newPassword,
    });

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.post('/api/login', async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  })

  if (!user) {
    return res.json({ status: 'error', error: 'Invalid login' })
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, user.password)

  if (isPasswordValid) {
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      }, 'secret123')


    await logActivity(user.email, 'sign-in');

    return res.json({ status: 'ok', user: token })
  }
  else {
    return res.json({ status: 'error', user: false })
  }
})

// tables
const getCollection = (collectionName) => async (req, res) => {
  try {
    const Model = Collection.getModel(collectionName);
    const data = await Model.find({});
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const tableRoutes = Object.values(TABLE_NAMES).map(tableName => {
  return {
    path: `/api/table/${tableName}`,
    handler: getCollection(tableName)
  };
});

tableRoutes.forEach(route => {
  app.get(route.path, route.handler);
});


app.get('/api/recipes/:id', (req, res) => {
  const Recipe = Collection.getModel(TABLE_NAMES.RECIPES);
  const id = parseInt(req.params.id);
  Recipe.findOne({ RecipeId: id }, (err, recipe) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else if (!recipe) {
      res.sendStatus(404);
    } else {
      res.send(recipe);
    }
  });
});


const getRecipeIngredients = async (req, res) => {
  try {
    const RecipeIngredients = Collection.getModel(TABLE_NAMES.RECIPE_INGREDIENTS);
    const Ingredients = Collection.getModel(TABLE_NAMES.INGREDIENTS);
    const Measurement = Collection.getModel(TABLE_NAMES.MEASUREMENTS);

    const recipeId = parseInt(req.params.id);
    const ingredientDetails = await RecipeIngredients.find({ recipe_ID: recipeId });

    const result = await Promise.all(
      ingredientDetails.map(async ({ ingredient_ID, measurement_ID, amount }) => {
        const ingredient = await Ingredients.findOne({ id: ingredient_ID }).select('ingredient');
        const measurement = measurement_ID ? (await Measurement.findOne({ measurement_id: measurement_ID }).select('measurement')).measurement : null;
        return {
          name: ingredient.ingredient,
          measurement: measurement,
          amount: amount
        };
      })
    );
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


app.get('/api/recipes/:id/ingredients', getRecipeIngredients);


app.get('/api/recipes/:id/tags', async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    // console.log(recipeId)
    const tagCategories = Object.keys(TABLE_NAMES).filter(name => name.endsWith('_CATEGORIES') && !name.startsWith('RECIPE_'));
    // console.log("tagCategories: " , tagCategories)
    const tagPromises = tagCategories.map(async tableName => {
      const name = TABLE_NAMES[`RECIPE_${tableName}`];

      const RecipeTagsCategories = Collection.getModel(TABLE_NAMES[`RECIPE_${tableName}`]);

      const recipeTags = await RecipeTagsCategories.find({ recipe_ID: recipeId });

      if (!recipeTags || recipeTags.length === 0) {
        return [];
      }

      const categoryIDs = recipeTags.map(tag => tag.category_ID);
      const tagPromises = categoryIDs.map(async (categoryID) => {
        const TagsCategories = Collection.getModel(TABLE_NAMES[tableName]);
        return await TagsCategories.findOne({ id: categoryID });
      });
      const tags = await Promise.all(tagPromises);
      const modifiedTags = tags.map(tag => {
        if (tag) {
          const keys = Object.keys(tag);
          const lastKey = keys[keys.length - 1];
          const modifiedTag = { [lastKey]: tag[lastKey] };
          return modifiedTag;
        }
        return null;
      });
      return modifiedTags;
    });

    const allTags = await Promise.all(tagPromises);
    const flattenedTags = [].concat(...allTags);
    const valuesOnly = flattenedTags.map(tag => {
      if (tag) {
        const values = Object.values(tag);
        return values.length > 0 ? values[0] : null;
      }
      return null;
    });
    res.json(valuesOnly);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/api/search_recipe', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const filteredCollections = collections.filter(collection => /^(?!recipe).*categories$/.test(collection.name));
    const result = {};

    // Asynchronously fetch documents for each collection
    const fetchDocumentsPromises = filteredCollections.map(async collection => {
      const documents = await mongoose.connection.db.collection(collection.name).find().toArray();
      const values = documents.map(doc => [Object.values(doc)[1], Object.values(doc)[2]]);
      result[collection.name] = values;
    });

    // Wait for all promises to complete
    await Promise.all(fetchDocumentsPromises);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/api/recipes_categories', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const recipeCollections = collections.filter(collection => collection.name.startsWith("recipe_") && collection.name.endsWith("_categories"));

    const result = {};

    // Asynchronously fetch documents for each collection
    const fetchDocumentsPromises = recipeCollections.map(async collection => {
      const docs = await mongoose.connection.db.collection(collection.name).find().toArray();
      result[collection.name] = docs;
    });

    // Wait for all promises to complete
    await Promise.all(fetchDocumentsPromises);

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/api/recipes/images/:recipeId', async (req, res) => {
  const Image = Collection.getModel(TABLE_NAMES.RECIPES_IMAGES);
  const id = parseInt(req.params.recipeId);

  try {
    const distinctImageLinkFields = await Image.find({ recipe_ID: id }).distinct('image_link');

    if (!distinctImageLinkFields || distinctImageLinkFields.length === 0) {
      res.status(404).send('Images not found');
      return;
    }

    const images = distinctImageLinkFields.map(image_link => {
      if (typeof image_link === "string") {
        return image_link;
      } else if (image_link && image_link.filename && image_link.fileId) {
        const { filename, fileId } = image_link;
        return { filename, fileId };
      } else {
        res.status(500).send('Invalid image_link format');
      }
    });

    res.send(images.filter(Boolean)); // Filter out null values
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).send('Error fetching images');
  }
});


app.get('/api/favorites/:recipeId/:userId', (req, res) => {
  const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
  const user_id = req.params.userId;
  const recipe_id = parseInt(req.params.recipeId);
  Favorites.findOne({ user_id: user_id, recipe_id: recipe_id }, (err, like) => {
    if (err) {
      return res.json({ status: 'false' });
    }
    else if (!like) {
      return res.json({ status: 'false' });
    }
    else {
      return res.json({ status: 'true' });
    }
  })
});


app.post('/api/favorites/:recipeId/:userId', async (req, res) => {
  const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
  const user_id = req.params.userId;
  const recipe_id = parseInt(req.params.recipeId);

  try {
    // Create a new favorite
    await Favorites.create({
      user_id: user_id,
      recipe_id: recipe_id,
    });

    // Log the "like" activity
    await logActivity(user_id, 'like', { recipeId: recipe_id });

    res.json({ status: 'ok', message: 'Recipe favorited successfully' });
  } catch (error) {
    console.error('Error creating favorite:', error);
    res.json({ status: 'error', message: 'Could not favorite recipe' });
  }
});


app.delete('/api/favorites/:recipeId/:userId', (req, res) => {
  const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES)
  const user_id = req.params.userId;
  const recipe_id = parseInt(req.params.recipeId);
  // console.log("use " + user_id)
  // console.log("rec " + recipe_id)
  Favorites.deleteMany({ user_id, recipe_id }, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});


app.get('/api/favorites/:userId', async (req, res) => {
  const Favorites = Collection.getModel(TABLE_NAMES.FAVORITES);
  const Recipe = Collection.getModel(TABLE_NAMES.RECIPES);
  try {
    const user_id = req.params.userId;

    // Find the favorites for the given user
    const favorites = await Favorites.find({ user_id: user_id });

    if (favorites.length === 0) {
      res.json([]); // No favorites found, return an empty array
      return;
    }

    const recipeIds = favorites.map(favorite => favorite.recipe_id);
    // console.log('Recipe IDs:', recipeIds);
    // Find the actual recipe documents using the recipe IDs
    const favoriteRecipes = await Recipe.find({ RecipeId: { $in: recipeIds } });
    res.json(favoriteRecipes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching favorites');
  }
});


app.get('/api/trending', async (req, res) => {
  console.log("trending");
  const Recipe = Collection.getModel(TABLE_NAMES.RECIPES);

  try {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    console.log('oneWeekAgo:', oneWeekAgo);
    console.log('today:', today);

    const topRecipes = await Recipe.aggregate([
      {
        $lookup: {
          from: 'ratings',
          let: { recipeId: '$RecipeId' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$recipe_id', '$$recipeId'] }
              }
            },
            {
              $group: {
                _id: '$recipe_id',
                totalOverallRating: { $sum: '$rating' },
                overallRatingCount: { $sum: 1 },
                totalWeeklyRating: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$date', oneWeekAgo] },
                          { $lt: ['$date', today] }
                        ]
                      },
                      '$rating',
                      0
                    ]
                  }
                },
                weeklyRatingCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$date', oneWeekAgo] },
                          { $lt: ['$date', today] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            },
            {
              $project: {
                _id: 1,
                averageWeeklyRating: { $cond: [{ $eq: ['$weeklyRatingCount', 0] }, 0, { $divide: ['$totalWeeklyRating', '$weeklyRatingCount'] }] },
                overallRating: { $cond: [{ $eq: ['$overallRatingCount', 0] }, 0, { $divide: ['$totalOverallRating', '$overallRatingCount'] }] }
              }
            }
          ],
          as: 'ratingData'
        }
      },
      {
        $unwind: {
          path: '$ratingData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          averageWeeklyRating: { $ifNull: ['$ratingData.averageWeeklyRating', 0] },
          overallRating: { $ifNull: ['$ratingData.overallRating', 0] }
        }
      },
      {
        $addFields: {
          compositeScore: {
            $add: [
              { $multiply: ['$averageWeeklyRating', 0.7] },
              { $multiply: ['$overallRating', 0.3] }
            ]
          }
        }
      },
      {
        $sort: { compositeScore: -1 }
      },
      {
        $limit: 10
      }
    ]).exec();

    console.log('topRecipes:', topRecipes);
    console.log('len:', topRecipes.length);

    res.json(topRecipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.get('/api/groceries', async (req, res) => {
  const ingredient = Collection.getModel(TABLE_NAMES.INGREDIENTS);
  try {
    const ingredients = await ingredient.find()
    res.json(ingredients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/measurements', async (req, res) => {
  const measurement = Collection.getModel(TABLE_NAMES.MEASUREMENTS);
  try {
    const measurements = await measurement.find()
    res.json(measurements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.get('/api/addRecipe/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const readstream = gfs.openDownloadStream(ObjectId(filename));

  readstream.on('error', (error) => {
    console.error('Error retrieving image:', error);
    res.status(404).send('Image not found');
  });

  readstream.pipe(res);
});


// Define the route to get time category tags
app.get('/api/time-category-tags', async (req, res) => {
  try {
    const timeCategoryScheme = Collection.getModel(TABLE_NAMES.TIME_CATEGORIES);

    // Fetch all time category tags from the database
    const timeCategoryTags = await timeCategoryScheme.find({}, { id: 1, time: 1 }).exec();

    // Send the fetched tags as the response
    res.json(timeCategoryTags);
  } catch (error) {
    console.error('Error fetching time category tags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/api/my_recipes/:userId', async (req, res) => {
  const Recipe = Collection.getModel(TABLE_NAMES.RECIPES);
  try {
    const user_id = req.params.userId;


    const my_recipes = await Recipe.find({ AuthorId: user_id });

    if (my_recipes.length === 0) {
      // console.log("empty")
      res.json([]);
      return;
    }
    // console.log(my_recipes)
    res.json(my_recipes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching my recipes');
  }
});


app.get('/api/search_recipes/:recipeId/:ingredientId', async (req, res) => {
  const RecipeIngredients = Collection.getModel(TABLE_NAMES.RECIPE_INGREDIENTS);
  const recipeId = parseInt(req.params.recipeId);
  const ingredientId = parseInt(req.params.ingredientId);

  try {
    const result = await RecipeIngredients.findOne({ recipe_ID: recipeId, ingredient_ID: ingredientId });
    // console.log(result)

    if (result) {
      // Combination of recipeId and ingredientId exists in the table
      res.status(200).json({ message: 'Found the combination in the table' });
    } else {
      // Combination does not exist in the table
      res.status(404).json({ message: 'Combination not found in the table' });
    }
  } catch (error) {
    console.error('Error checking combination in the table:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/update_user_details/:userId', async (req, res) => {
  const { userId } = req.params;
  const { newPassword, newDistrict } = req.body;

  const Users = Collection.getModel(TABLE_NAMES.USERS);

  try {
    // Prepare update fields based on provided data
    const updateFields = {};

    if (newDistrict) {
      updateFields.district = newDistrict;
    }

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateFields.password = hashedPassword;
    }

    // Perform findOneAndUpdate
    const updatedUser = await Users.findOneAndUpdate(
      { email: userId }, // Find user by current email
      { $set: updateFields }, // Set the fields to update
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User details updated successfully', updatedUser });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(1337, () => {
  console.log('Server saterted on 1337')
})