const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviweSchema = new Schema({
    body: {
        type: String,
        required: true,
        set: v => v.trim() // automatically trims before saving
    },
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Review", reviweSchema);