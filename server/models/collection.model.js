const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  // Define your collection schema here
}, { strict: false }); // Set strict option to false to allow different collections to have different fields

module.exports = {
  getModel: (collectionName) => mongoose.model('Collection', collectionSchema, collectionName),
};