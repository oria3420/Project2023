const mongoose = require('mongoose');

const GlobalVocabulariesSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['category', 'tag'],
        required: true
    },
    vocabulary: {
        type: [String],
        default: []
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
},
{collection: 'global_vocabularies'}
);

module.exports = mongoose.model('globalVocabularies', GlobalVocabulariesSchema);
