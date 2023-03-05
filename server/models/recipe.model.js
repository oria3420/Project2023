const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({}, { collection: 'Recipes' });
const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;