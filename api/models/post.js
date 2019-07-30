const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title field is required'],
    },
    body: {
        type: String,
        required: [true, 'Body field is required'],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

postSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Post', postSchema);
