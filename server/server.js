require('./config/config');

const _ = require('lodash');

var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Todo } = require('./models/todo');

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



app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = { app };