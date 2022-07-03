const { MongoClient } = require("mongodb");
const config = require("./config");
const client = new MongoClient(config.mongodburl);

var db;

MongoClient.connect(config.mongodburl, function(err, client) {
    if(err) throw err;
    db = client.db("test");
    let collection = "resumes";
    var inserts = [];
    for (var i = 0; i < 1000; i++) {
        inserts.push(queryInsertPromise(collection, {name: i}));
    }
    var queries = [];
    for (var i = 0; i < 1000; i++) {
        queries.push(queryPromise(collection, {name: i}));
    }
    console.log("Started");
    Promise.all(inserts).then(function(result) {
      console.log("Inserted");
      Promise.all(queries).then(function(result) {
        console.log("Queried");
        client.close();
      }).catch(function(err) {
        console.log(err);
        client.close();
      });
    }).catch(function(err) {
        console.log(err);
        client.close();
    });


    function queryInsertPromise(collection, query) {
        return new Promise(function(resolve, reject) {
            db.collection(collection).insertOne(query, function(err, resp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        })
    }
    function queryPromise(collection, query) {
      return new Promise(function(resolve, reject) {
          db.collection(collection).find(query).toArray(function(err, resp) {
              if (err) {
                  reject(err);
              } else {
                  resolve(resp);
              }
          });
      })
  }
});