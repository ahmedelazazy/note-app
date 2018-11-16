const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log("Error while connecting to Mongodb");
    }

    console.log("Connected to Mongodb");

    // db.collection('Todos').insertOne({
    //     text: 'My first note',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log("Error while inserting the note", err);
    //     }

    //     console.log(JSON.stringify(result.ops, null, 2));
    // });

    // db.collection('Users').insertOne({
    //     name: 'Ahmed Elazazy',
    //     age: 30,
    //     location: 'Cairo'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log("Error while inserting user", err);
    //     }
    //     console.log(JSON.stringify(result.ops, null, 2));
    // });


    // db.collection('Users').find({ name: 'AZ' })
    //     .count()
    //     .then((data) => { console.log(data) },
    //         (error) => { console.log(error) });


    // db.collection('Users').deleteOne({ name: 'AZ' })
    //     .then((data) => { console.log(data) },
    //         (error) => { console.log(error) });

    // db.collection('Users').findOneAndDelete({ a: 'a' })
    //     .then((data) => { console.log(data) },
    //         (error) => { console.log(error) });



    db.collection('Users').findOneAndUpdate(
        { _id: new ObjectId('5bee0c29284555c0ff6c251a') },
        { $set: { a: "AZ2" } },
        { returnOriginal: false })
        .then((data) => { console.log(data) },
            (error) => { console.log(error) });

    // db.close();
});