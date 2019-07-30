const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email field is required'],
        unique: [true, 'Email already exists'],
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password: {
        type: String,
        required: [true, 'Password field is required'],
        minlength: [5, 'Password field needs at least 5 characters'],
        maxlength: [16, 'Password field cannot be higher than 16 characters'],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

UserSchema.pre('save', async function (next) {
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

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', UserSchema);
