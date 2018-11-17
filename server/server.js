require('./config/config');

const _ = require('lodash');

var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Todo } = require('./models/todo');
const { authenticate } = require('./middleware/authenticate');

var port = process.env.PORT;

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then(
        data => {
            res.send(data);
        },
        error => {
            res.status(400).send(error);
        }
    );
});

app.get('/todos', (req, res) => {
    Todo.find().then(data =>
        res.send({ todos: data }),
        error => res.status(400).send(error));
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id).then(data => {
        if (!data) {
            return res.status(404).send();
        }
        return res.send({ todo: data });
    },
        error => res.status(400).send());
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then(data => {
        if (!data) {
            return res.status(404).send();
        }
        return res.send({ todo: data });
    }
    ).catch(error => res.status(400).send());
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    var body = _.pick(req.body, [ 'text', 'completed' ]);

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(data => {
        if (!data) {
            res.status(404).send();
        }

        res.send({ todo: data });
    }).catch(error => res.status(400).send());
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, [ 'email', 'password' ]);
    var user = new User(body);
    user.save()
        .then(() => user.generateAuthToken())
        .then(token => res.header('x-auth', token).send(user))
        .catch(error => { res.status(400).send(error) });
});



app.get('/users/me', authenticate, (req, res) => {
    var token = req.header('x-auth');
    User.findByToken(token).then(user => {
        if (!user) {
            return Promise.reject();
        }
        res.send(user);
    }).catch(() => res.status(401).send());
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = { app };