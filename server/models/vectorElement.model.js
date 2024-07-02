// models/vectorElement.model.js
const mongoose = require('mongoose');

const VectorElementSchema = new mongoose.Schema({
    value: { type: Number, required: true },
    type: { type: String, required: true }, // 'category' or 'tag'
    name: { type: String, required: true }
}, { _id: false });

module.exports = VectorElementSchema;
