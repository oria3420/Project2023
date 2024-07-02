// models/usersProfile.model.js
const mongoose = require('mongoose');
const VectorElementSchema = require('./vectorElement.model');


const UsersProfileSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    vector: [VectorElementSchema],
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'users_profile' });

module.exports = mongoose.model('UsersProfile', UsersProfileSchema);
