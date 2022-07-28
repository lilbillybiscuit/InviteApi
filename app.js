var express = require("express"),
  app = express(),
  port = process.env.PORT || 8000;

var cors = require("cors");
var config = require("./config");
var session = require("express-session");
const MongoStore = require("connect-mongo");
require('dotenv').config()
//if (config.production) app.use(cors({ origin: "http://3.16.107.216" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(
  cors({
    origin: config.websiteUrl, //careful might not work with NextJS
    credentials: true,
  })
);
app.use(
  session({
    secret: config.cookieSecret,
    resave: false,
    saveUninitialized: false, // was false before
    unset: "keep",
    cookie: {
      secure: false, //production on = https should be on
      maxAge: config.cookieMaxAge,
    },
    store: MongoStore.create({
      mongoUrl: config.mongodburl,
      autoRemove: "native",
      dbName: config.mongodbname,
    }),
  })
);

//app.use(express.static('public'));

var routes = null;

const database = require("./api/db");

module.exports.listen = () => {
  database
    .connect()
    .then(() => console.log("Connected to database"))
    .then(() => {
      routes = require("./api/routes/listroutes"); //importing route

      routes(app); //register the route
      app.listen(port, function () {
        console.log(`PID ${process.pid}: Listening on port ${port}`);
      });
    });
};
