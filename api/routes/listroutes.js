const con = null;

//Don't worry about any of this function stuff, just add any routes below
//by copying and pasting the code
module.exports = function (app) {
  var tests = require("../controllers/test");
  var usersettings = require("../controllers/settings");
  var accounts = require("../controllers/accounts");
  app.route("/api/success").get(tests.returnSuccess);
  app.route("/api/error").get(tests.returnError);

  app.route("/api/usersettings").get(usersettings.get_user_email_settings);
  app.route("/api/setusersetting").post(usersettings.set_user_email_settings);

  app.route("/api/create_token").post(accounts.create_valid_token);
  
};
