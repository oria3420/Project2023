const cron = require('node-cron');
const initGlobalVocabularies = require('./initGlobalVocabularies');
const initUsersProfile = require('./initUsersProfile');
const initRecipeVectors = require('./initRecipeVectors');

let mongooseConnection; // Variable to hold Mongoose connection object

// Function to set Mongoose connection
function setMongooseConnection(connection) {
  mongooseConnection = connection;

  // Start scheduling tasks if Mongoose is connected
  if (mongooseConnection.readyState === 1) {
    startScheduledTasks();
  } else {
    console.error('Mongoose is not connected. Tasks will not be scheduled.');
  }
}

// Function to start scheduled tasks
function startScheduledTasks() {
  cron.schedule('0 1 * * 1', async () => {
    if (mongooseConnection && mongooseConnection.readyState !== 1) {
      console.error('Mongoose is not connected. Task skipped.');
      return;
    }

    console.log('Running scheduled task...');

    try {
      // Execute initGlobalVocabularies first and wait for it to complete
      await initGlobalVocabularies();

      // Run initUsersProfile and initRecipeVectors concurrently
      const userProfilePromise = initUsersProfile();
      const recipeVectorsPromise = initRecipeVectors();

      await Promise.all([userProfilePromise, recipeVectorsPromise]);

      console.log('Scheduled tasks completed.');
    } catch (error) {
      console.error('Error running scheduled task:', error);
    }
  });

  console.log('Task scheduling setup complete');
}

module.exports = {
  setMongooseConnection
};
