// models/recipesVectors.model.js
const mongoose = require('mongoose');
const VectorElementSchema = require('./vectorElement.model');


const RecipesVectorsSchema = new mongoose.Schema({
    recipeId: Number,
    vector: [VectorElementSchema],
    updatedAt: Date
}, { collection: 'recipes_vectors' });

module.exports = mongoose.model('RecipesVectors', RecipesVectorsSchema);
