var express = require("express"),
  app = express(),
  port = process.env.PORT || 8000

var cors = require("cors");
var config = require("./config");
var cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');

//if (config.production) app.use(cors({ origin: "http://3.16.107.216" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cors({
  origin: "*",
}));

app.use(session({
	secret: config.cookieSecret,
	resave: false,
	saveUninitialized: false,
  unset: "keep",
  cookie: {
    secure: config.production, //production on = https should be on
    maxAge: config.cookieMaxAge,
  }
  store: MongoStore.create({
    mongoUrl: config.mongodburl,
    autoRemove: "native"
    dbName: config.mongodbname,
    crypto: {
      secret: config.cookieMongoSecret
    }
  }),
}));

var routes = null;

const database = require("./api/db");

database
  .connect()
  .then(() => console.log("Connected to database"))
  .then(() => {
    routes = require("./api/routes/listroutes"); //importing route
    
    
    routes(app); //register the route
    app.listen(port);
    console.log("Invite API server started on: http://localhost:" + port);
  });

process.on("SIGINT", function () {
  console.log("Stopping server...");
  process.exit();
});
