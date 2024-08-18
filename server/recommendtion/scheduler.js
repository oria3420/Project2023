// scheduler.js
const cron = require('node-cron');
const initGlobalVocabularies = require('./initGlobalVocabularies');
const initUsersProfile = require('./initUsersProfile');
const initRecipeVectors = require('./initRecipeVectors');
const Setting = require('../models/Settings');

let mongooseConnection;
let currentTask;

// Function to set Mongoose connection
function setMongooseConnection(connection) {
  mongooseConnection = connection;

  if (mongooseConnection.readyState === 1) {
    startScheduledTasks();
  } else {
    console.error('Mongoose is not connected. Tasks will not be scheduled.');
  }
}

// Function to get cron expression based on frequency
function getCronExpression(frequency) {
  switch (frequency) {
    case 'every-min':
      return '* * * * *'; // Every min
    case 'once-a-week':
      return '0 1 * * 1'; // Every Monday at 1 AM
    case 'twice-a-week':
      return '0 1 * * 1,4'; // Every Monday and Thursday at 1 AM
    case 'everyday':
      return '0 1 * * *'; // Everyday at 1 AM
    default:
      return '0 1 * * 1'; // Default to once a week
  }
}

// Function to start scheduled tasks
async function startScheduledTasks() {
  if (currentTask) {
    currentTask.stop(); // Stop the current task
  }

  const frequencySetting = await Setting.findOne({ key: 'calculation_frequency' });

  let cronExpression = '0 1 * * 1'; // Default cron expression

  if (frequencySetting) {
    cronExpression = getCronExpression(frequencySetting.value);
  }

  currentTask = cron.schedule(cronExpression, async () => {
    if (mongooseConnection && mongooseConnection.readyState !== 1) {
      console.error('Mongoose is not connected. Task skipped.');
      return;
    }

    console.log('Running scheduled task...');

    try {
      await initGlobalVocabularies();

      const userProfilePromise = initUsersProfile();
      const recipeVectorsPromise = initRecipeVectors();

      await Promise.all([userProfilePromise, recipeVectorsPromise]);

      console.log('Scheduled tasks completed.');
    } catch (error) {
      console.error('Error running scheduled task:', error);
    }
  });

  console.log(`Task scheduled with cron expression: ${cronExpression}`);
}

module.exports = {
  setMongooseConnection,
  startScheduledTasks,
};
