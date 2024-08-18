// initSettings.js
const Setting = require('./models/Settings');

// Function to initialize settings
const initializeSettings = async () => {
    try {
        // Check if the setting already exists
        const existingSetting = await Setting.findOne({ key: 'calculation_frequency' });

        if (!existingSetting) {
            // Create a new setting if it doesn't exist
            const newSetting = new Setting({
                key: 'calculation_frequency',
                value: 'once-a-week' // Default value
            });
            await newSetting.save();
            console.log('Initialized setting: calculation_frequency');
        } else {
            console.log('Setting already exists: calculation_frequency');
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
};

module.exports = initializeSettings;
