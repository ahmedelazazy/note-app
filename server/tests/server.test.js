const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { populateTodos, seedTodos, seedUsers, populateUsers } = require('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);

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

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', seedUsers[ 0 ].tokens[ 0 ].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(seedUsers[ 0 ]._id.toHexString());
                expect(res.body.email).toBe(seedUsers[ 0 ].email);
            })
            .end(done);
    });

    it('should return unauthenticated if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'email1@mail.com';
        var password = 'testPass'
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect(res => {
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
                expect(res.headers[ 'x-auth' ]).toExist();
            }).end(err => {
                if (err) {
                    return done(err);
                }
                User.findOne({ email }).then(user => {
                    expect(user).toExist();
                    expect(user.email).toEqual(email);
                    expect(user.password).toNotEqual(password);
                    done();
                })
            });
    });

    it('should not create a user if input is invalid', (done) => {
        request(app)
            .post('/users')
            .send({ email: 'email', password: '1' })
            .expect(400)
            .end(done);
    });

    it('should create a user if email is already used', (done) => {
        request(app)
            .post('/users')
            .send({ email: seedUsers[ 0 ].email, password: '12345678' })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({ email: seedUsers[ 1 ].email, password: seedUsers[ 1 ].password })
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toEqual(seedUsers[ 1 ].email);
                expect(res.headers[ 'x-auth' ]).toExist;
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                User.findById(seedUsers[ 1 ]._id).then(user => {
                    expect(user.tokens[ 0 ]).toInclude({ access: 'auth', token: res.headers[ 'x-auth' ] });
                    done();
                }).catch(e => done(e))
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({ email: seedUsers[ 1 ].email, password: seedUsers[ 1 ].password + 'invalid' })
            .expect(400)
            .expect((res) => {
                expect(res.headers[ 'x-auth' ]).toNotExist;
            })
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                User.findById(seedUsers[ 1 ]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    })
                    .catch(e => done(e));
            });
    });
});

describe('DELETE users/me/token', () => {
    it('should logout valid user', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', seedUsers[ 0 ].tokens[ 0 ].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    done(err);
                }
                User.findById(seedUsers[ 0 ]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    }).catch(e => done(e));

            });
    });
});