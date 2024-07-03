// // scheduler.js
// const cron = require('node-cron');

// // Schedule a task to run once a week (every Sunday at midnight)
// cron.schedule('0 0 * * 0', () => {
//     console.log('Running weekly pre-calculations...');
//     require('./initUsersProfile.js');
//     require('./initRecipeVectors.js');
//     require('./initGlobalVocabularies.js');
// });

// console.log('Task scheduling setup complete');

const cron = require('node-cron');

// Import initialization functions
const initGlobalVocabularies = require('./initGlobalVocabularies');
const initUsersProfile = require('./initUsersProfile');
const initRecipeVectors = require('./initRecipeVectors');

cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled task...');
    
    try {
        // Execute initGlobalVocabularies first and wait for it to complete
        await initGlobalVocabularies();
        
        // Then execute initUsersProfile and initRecipeVectors
        initUsersProfile();
        initRecipeVectors();
        
    } catch (error) {
        console.error('Error running scheduled task:', error);
    }
});

console.log('Task scheduling setup complete');
