const Activity = require('../models/Activity');

const logActivity = async (userId, type, details = {}) => {
  try {
    const activity = new Activity({
      userId,
      type,
      details
    });
    await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = {
  logActivity
};
