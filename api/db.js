//HOW TO USE:
//const connection = require(path to this file).get();
//OR
//const database = require(path to this file).getdatabase();
//var collection = database.collection(collection name);

const { MongoClient } = require("mongodb");

var url = require("../config").mongodburl;

let connection = null;

module.exports.connect = () =>
  new Promise((resolve, reject) => {
    MongoClient.connect(url, function (err, db) {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
      connection = db;
    });
  });

module.exports.get = () => {
  if (!connection) {
    throw new Error("Call connect first!");
  }

  return connection;
};
module.exports.getdatabase = () => {
  if (!connection) throw new Error("Call connect first!");
  return connection.db("invite");
};
