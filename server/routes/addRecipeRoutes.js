const express = require('express');
const Collection = require('../models/collection.model');
const globals = require('../../client/src/common/tablesNames');
const ObjectId = require('mongodb').ObjectID;
const { logActivity } = require('../utils/activityLogger');
const path = require('path');
const TABLE_NAMES = globals.TABLE_NAMES;

const parseTimeToDuration = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  let duration = '';
  if (hours > 0) duration += hours.toString() + 'H';
  if (minutes > 0) duration += minutes.toString() + 'M';
  return duration || '0S';
};

const sumDurations = (duration1, duration2) => {
  const [hours1 = 0, minutes1 = 0] = duration1.match(/\d+/g).map(Number);
  const [hours2 = 0, minutes2 = 0] = duration2.match(/\d+/g).map(Number);
  const totalHours = hours1 + hours2;
  const totalMinutes = minutes1 + minutes2;
  return `${String(totalHours).padStart(2, '0')}:${String(totalMinutes).padStart(2, '0')}`;
};

const convertToKilograms = (amount, measurement) => {
  console.log("amount: ", amount);
  console.log("measurement: ", measurement);
  const conversion_factors = {
    'kilogram': 1,
    'gram': 0.001,
    'teaspoon': 0.00492892,
    'tablespoon': 0.0147868,
    'fluid ounce': 0.0295735,
    'cup': 0.236588,
    'pint': 0.473176,
    'quart': 0.946353,
    'gallon': 3.78541,
    'ounce': 0.0283495,
    'pound': 0.453592,
    'milliliter': 0.001,
    'liter': 1,
  };
  return amount * conversion_factors[measurement];
};

const calculateNutritionForIngredient = async (ingredientId, amount, measurementId, Ingredients, Measurement) => {
  try {
    const ingredient = await Ingredients.findOne({ id: ingredientId });
    const measurement = await Measurement.findOne({ measurement_id: parseInt(measurementId) });

    if (!ingredient || !measurement) {
      console.error(`Ingredient or measurement not found for id: ${ingredientId} or measurementId: ${measurementId}`);
      return null;
    }

    const quantityInKg = convertToKilograms(amount, measurement.measurement);
    console.log("quantityInKg: ", quantityInKg)
    const nutrition = {
      calories: ingredient.calories * quantityInKg || 0,
      fat: ingredient.fat * quantityInKg || 0,
      saturated_fat: ingredient.saturated_fat * quantityInKg || 0,
      cholesterol: ingredient.cholesterol * quantityInKg || 0,
      sodium: ingredient.sodium * quantityInKg || 0,
      carbohydrates: ingredient.carbohydrates * quantityInKg || 0,
      fiber: ingredient.fiber * quantityInKg || 0,
      sugar: ingredient.sugar * quantityInKg || 0,
      protein: ingredient.protein * quantityInKg || 0,
    };

    return nutrition;
  } catch (error) {
    console.error(`Error fetching nutritional information for ingredient ${ingredientId}: ${error.message}`);
    return null;
  }
};

const calculateTotalNutrition = async (groceryList, RecipeIngredients, Ingredients, Measurement, rec_id) => {
  let totalNutrition = {
    calories: 0,
    fat: 0,
    saturated_fat: 0,
    cholesterol: 0,
    sodium: 0,
    carbohydrates: 0,
    fiber: 0,
    sugar: 0,
    protein: 0,
  };

  for (const groceryItem of JSON.parse(groceryList)) {
    const { measurementId, amount, id } = groceryItem;
    console.log(groceryItem)
    const nutrition = await calculateNutritionForIngredient(id, amount, measurementId, Ingredients, Measurement);
    console.log("nutrition: ", nutrition)
    if (nutrition) {
      totalNutrition.calories += nutrition.calories;
      totalNutrition.fat += nutrition.fat;
      totalNutrition.saturated_fat += nutrition.saturated_fat;
      totalNutrition.cholesterol += nutrition.cholesterol;
      totalNutrition.sodium += nutrition.sodium;
      totalNutrition.carbohydrates += nutrition.carbohydrates;
      totalNutrition.fiber += nutrition.fiber;
      totalNutrition.sugar += nutrition.sugar;
      totalNutrition.protein += nutrition.protein;
    }
    await RecipeIngredients.create({
      recipe_ID: rec_id,
      ingredient_ID: id,
      measurement_ID: parseInt(measurementId),
      amount: parseFloat(amount),
    });
  }
  for (const nutrient in totalNutrition) {
    if (totalNutrition.hasOwnProperty(nutrient)) {
      totalNutrition[nutrient] = parseFloat(totalNutrition[nutrient].toFixed(2));
    }
  }

  return totalNutrition;
};

const insertRecipeCategories = async (recipeCategories, rec_id, Collection) => {
  for (const [category, selectedItems] of Object.entries(JSON.parse(recipeCategories))) {
    if (Object.keys(selectedItems).length > 0) {
      const tableName = `recipe_${category.toLowerCase()}`;
      const trueItems = Object.entries(selectedItems)
        .filter(([itemId, isSelected]) => isSelected)
        .map(([itemId]) => itemId);
      for (const itemId of trueItems) {
        await Collection.getModel(tableName).create({
          recipe_ID: rec_id,
          category_ID: parseInt(itemId),
        });
      }
    }
  }
};

const saveUploadedImages = async (files, rec_id, Image) => {
  for (const file of files) {
    const newImage = new Image({
      recipe_ID: rec_id,
      image_link: {
        filename: file.originalname,
        fileId: file.id,
      },
    });
    await newImage.save();
  }
};

async function getNextRecipeId(Setting) {
  try {
    const result = await Setting.findOneAndUpdate(
      { key: "recipe_id" },
      { $inc: { value: 1 } }, // Increment the value by 1
      { new: true } // Return the updated document
    );
    return result.value;
  } catch (error) {
    console.error('Error updating recipe_id:', error);
    throw new Error('Failed to generate new recipe ID');
  }
}

async function getKosherCategory(recipeCategories, KosherT) {
  try {
    const checkedKosherCategoryIds = Object.keys(JSON.parse(recipeCategories)['kosher_categories'] || {}).filter(
      (checkboxId) => JSON.parse(recipeCategories)['kosher_categories'][checkboxId]
    );

    if (checkedKosherCategoryIds.length === 0) {
      throw new Error('No kosher category selected');
    }

    const kosherCategoryId = checkedKosherCategoryIds[0];
    const kosherWord = await KosherT.findOne({ id: parseInt(kosherCategoryId) });

    if (!kosherWord) {
      throw new Error('Kosher category not found');
    }

    return kosherWord.kosher;
  } catch (error) {
    console.error('Error fetching kosher category:', error.message);
    throw error;
  }
}


module.exports = (upload, gfs) => {

  const router = express.Router();

  // Route to serve uploaded images
  router.use('/images', express.static(path.join(__dirname, 'uploads')));

  // Route to add a new recipe
  router.post('/', upload.array('selectedImages'), async (req, res) => {

    try {
      console.log("in add recipe router");
      
      const Recipes = Collection.getModel(TABLE_NAMES.RECIPES);
      const Ingredients = Collection.getModel(TABLE_NAMES.INGREDIENTS);
      const RecipeIngredients = Collection.getModel(TABLE_NAMES.RECIPE_INGREDIENTS);
      const KosherT = Collection.getModel(TABLE_NAMES.KOSHER_CATEGORIES);
      const Image = Collection.getModel(TABLE_NAMES.RECIPES_IMAGES);
      const Measurement = Collection.getModel(TABLE_NAMES.MEASUREMENTS);
      const Setting = Collection.getModel(TABLE_NAMES.SETTINGS);
      const {
        recipeName,
        cookTime,
        prepTime,
        selectedCategory,
        groceryList,
        description,
        recipeServings,
        recipeYield,
        recipeInstructions,
        recipeCategories,
        name,
        userId,
      } = req.body;
      console.log(req.body);
      console.log("**********************************************")

      // Use the extracted function to get the next recipe ID
      const rec_id = await getNextRecipeId(Setting);
      console.log('Updated value of key:', rec_id);

      const totalCookTime = sumDurations(cookTime, prepTime);
      console.log("totalCookTime: ", totalCookTime);

      // Use the extracted function to get the kosher category
      const kosher = await getKosherCategory(recipeCategories, KosherT);
      console.log("kosher: ", kosher);

      // Calculate total nutrition
      const totalNutrition = await calculateTotalNutrition(groceryList, RecipeIngredients, Ingredients, Measurement, rec_id);
      console.log("totalNutrition: ", totalNutrition);
      const newRecipe = await Recipes.create({
        RecipeId: rec_id,
        Name: recipeName,
        AuthorId: userId,
        AuthorName: name,
        CookTime: parseTimeToDuration(cookTime),
        PrepTime: parseTimeToDuration(prepTime),
        TotalTime: parseTimeToDuration(totalCookTime),
        DatePublished: new Date().toISOString(),
        Description: description,
        RecipeCategory: selectedCategory,
        AggregatedRating: null,
        ReviewCount: 0,
        Calories: totalNutrition.calories,
        FatContent: totalNutrition.fat,
        SaturatedFatContent: totalNutrition.saturated_fat,
        CholesterolContent: totalNutrition.cholesterol,
        SodiumContent: totalNutrition.sodium,
        CarbohydrateContent: totalNutrition.carbohydrates,
        FiberContent: totalNutrition.fiber,
        SugarContent: totalNutrition.sugar,
        ProteinContent: totalNutrition.protein,
        RecipeServings: recipeServings,
        RecipeYield: recipeYield,
        RecipeInstructions: JSON.parse(recipeInstructions).join('.'),
        Kosher: kosher,
      });

      // // Save uploaded images
      await saveUploadedImages(req.files, rec_id, Image);

      // // Insert categories
      await insertRecipeCategories(recipeCategories, rec_id, Collection);

      await logActivity(userId, 'upload-recipe', { recipeId: newRecipe._id });
      console.log("finished");
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error adding recipe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};


