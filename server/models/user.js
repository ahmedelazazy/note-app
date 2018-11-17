const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        minlength: 1,
        trim: true,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [ {
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    } ]

});

UserSchema.methods.toJSON = function () {
    var userObject = this.toObject();
    return _.pick(userObject, [ '_id', 'email' ]);
}

UserSchema.methods.generateAuthToken = function () {
    var access = 'auth';
    var token = jwt.sign({ _id: this._id.toHexString(), access: access }, 'secret').toString();
    this.tokens = this.tokens.concat([ { access, token } ]);

    return this.save().then(() => token);
}

UserSchema.methods.removeToken = function (token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
}

UserSchema.statics.findByToken = function (token) {

    var decoded;

    try {
        decoded = jwt.verify(token, 'secret');
    } catch (error) {
        return Promise.reject();
    }

    return this.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    })
}

UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;

    return User.findOne({ email }).then(user => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                }
                reject();
            })
        });
    })
}

UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                user.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }

});

var User = mongoose.model('User', UserSchema);

module.exports = { User };