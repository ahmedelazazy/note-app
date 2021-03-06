const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

var userOneId = new ObjectID();
var userTwoId = new ObjectID();
const seedUsers = [ {
    _id: userOneId,
    email: 'user1@mail.com',
    password: 'userOnePass',
    tokens: [
        {
            access: 'auth',
            token: jwt.sign({ _id: userOneId.toHexString(), access: 'auth' }, process.env.JWT_SECRET).toString()
        }
    ]
}, {
    _id: userTwoId,
    email: 'user2@mail.com',
    password: 'userTwoPass',
    tokens: [
        {
            access: 'auth',
            token: jwt.sign({ _id: userTwoId.toHexString(), access: 'auth' }, process.env.JWT_SECRET).toString()
        }
    ]
} ];

const seedTodos = [
    {
        _id: new ObjectID(),
        text: 'first test todo',
        _creator: userOneId
    },
    {
        _id: new ObjectID(),
        text: 'second test todo',
        completed: true,
        completedAt: 123,
        _creator: userTwoId
    }
];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(seedTodos);
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(seedUsers[ 0 ]).save();
        var userTwo = new User(seedUsers[ 1 ]).save();
        return Promise.all([ userOne, userTwo ]);
    }).then(() => done());
}

module.exports = {
    seedTodos,
    populateTodos,
    seedUsers,
    populateUsers
};