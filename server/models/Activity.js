const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Store user email as userId
  type: { type: String, required: true, enum: ['rating', 'comment', 'sign-in', 'upload-recipe', 'like'] },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
