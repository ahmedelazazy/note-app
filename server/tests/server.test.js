const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const seedTodos = [
    {
        _id: new ObjectID(),
        text: 'first test todo'
    },
    {
        _id: new ObjectID(),
        text: 'second test todo',
        completed: true,
        completedAt: 123
    }
];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(seedTodos);
    }).then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var todoText = 'A new todo';

        request(app)
            .post('/todos')
            .send({ text: todoText })
            .expect(200)
            .expect(res => expect(res.body.text).toBe(todoText))
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text: todoText }).then(data => {
                    expect(data.length).toBe(1);
                    expect(data[ 0 ].text).toBe(todoText);
                    done();
                }).catch(error => done(error));
            })
    });

    it('should not create an invalid todo', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then(data => {
                    expect(data.length).toBe(2);
                    done();
                }).catch(error => done(error));
            })
    });


});

describe('GET /todos', () => {
    it('should return all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(
                res => {
                    expect(res.body.todos.length).toBe(2)
                })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return valid doc', (done) => {
        request(app)
            .get(`/todos/${seedTodos[ 0 ]._id.toHexString()}`)
            .expect(200)
            .expect(res => expect(res.body.todo.text).toBe(seedTodos[ 0 ].text))
            .end(done);
    });

    it('should return 404 in case of not found', (done) => {
        request(app)
            .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 in case of invalid id', (done) => {
        request(app)
            .get(`/todos/123`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should delete a note', (done) => {
        var id = seedTodos[ 0 ]._id.toHexString();
        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect(res => res.body.todo._id == id)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(id).then(data => {
                    expect(data).toNotExist();
                    done();
                }).catch(error => done(error));
            });
    });

    it('should return 404 if object not found', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if id is not valid', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update a todo and mark it completed', (done) => {
        var id = seedTodos[ 0 ]._id.toHexString();
        var text = "text updated from mocha"
        request(app)
            .patch(`/todos/${id}`)
            .send({ text: text, completed: true })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toNotBeA('Number')
            })
            .end(done)
    });

    it('should mark the not and not completed', (done) => {
        var id = seedTodos[ 1 ]._id.toHexString();
        var text = "text updated from mocha"
        request(app)
            .patch(`/todos/${id}`)
            .send({ text: text, completed: false })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist()
            })
            .end(done)
    });
});