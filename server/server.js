var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Todo } = require('./models/todo');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });
    todo.save().then(
        data => {
            //console.log(data);
            res.send(data);
        },
        error => {
            // console.log(error)
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



app.listen(3000, () => {
    console.log("Server started on port 3000");
});

module.exports = { app };