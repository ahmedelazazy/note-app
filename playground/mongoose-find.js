const { ObjectID } = require('mongodb');

const mongoose = require('./../server/db/mongoose');
const { User } = require('./../server/models/user');


var id = '5beedd087c0c2c2835d33f18';

if (!ObjectID.isValid(id)) {
    return console.log("Invalid object id");
}

User.find({ _id: id }).then(
    data => {
        if (!data || data.length == 0) {
            return console.log("Object not found.")
        }
        console.log(data);
    }
);

User.findOne({ _id: id }).then(
    data => {
        if (!data) {
            return console.log("Object not found.")
        }
        console.log(data);
    }
);

User.findById(id).then(
    data => {
        if (!data) {
            return console.log("Object not found.")
        }
        console.log(data);
    }
);
