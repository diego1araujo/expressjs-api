const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    const hash = await bcrypt.hashSync(this.password, 12);

    if (!hash) {
        return next();
    }

    this.password = hash;

    next();
});

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);
