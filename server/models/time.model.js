const mongoose = require('mongoose')

const timesSchema = new mongoose.Schema({}, { collection: 'Times_Categories' });
const Time = mongoose.model('Time', timesSchema);

module.exports = Time;