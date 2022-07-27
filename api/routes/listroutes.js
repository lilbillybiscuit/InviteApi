const con = null;

//Don't worry about any of this function stuff, just add any routes below
//by copying and pasting the code
module.exports = function (app) {
  var tests = require("../controllers/test");
  var usersettings = require("../controllers/settings");

  //Account-related routes
  var accounts = require("../controllers/accounts");
  app.route("/api/token/create").post(accounts.create_valid_token);

  app.route("/api/success").all(tests.returnSuccess);
  app.route("/api/error").all(tests.returnError);

  app.route("/api/usersettings").get(usersettings.get_user_email_settings);
  app.route("/api/usersettings/update").post(usersettings.set_user_email_settings);

  app.route("/api/tokens/create").post(accounts.create_valid_token);
  app.route("/api/tokens/delete").post(accounts.delete_token);
  //Session-related routes
  var sessions = require("../controllers/sessions");
  app.route("/api/session/getid").get(sessions.get_account_id);
  app.route("/api/session/getname").get(sessions.get_account_username);
  app.route("/api/session/auth").post(sessions.simpleAuth);
  app.route("/api/session/changeaccount").post(sessions.change_account);
  
  var rsvp = require("../controllers/rsvp");
  app.route("/api/rsvp/create").post(rsvp.RSVP);
  app.route("/api/rsvp/get").get(rsvp.getCurrentRSVP);

  var wifi = require("../controllers/wifi");
  app.route("/api/wifi/get").get(wifi.getWifi);

  var info = require("../controllers/info");
  app.route("/api/info/get").get(info.get_info);
  app.route("/api/info/initialmessage").get(info.get_initial_message);
  var guests = require("../controllers/guests");
  app.route("/api/guests/get/all").get(guests.getFullGuestList);
  app.route("/api/guests/get/pending").get(guests.getGuestListPending);
  app.route("/api/guests/get/guests").get(guests.getGuestListOnly);
  app.route("/api/guests/get/timeline").get(guests.getTimeline);

  var email = require("../controllers/email");
  app.route("/api/email/bounce").post(email.bounce_email);
  app.route("/api/email/complaint").post(email.complaint_email);

  // var debug = require("../controllers/debug");
  // app.route("/api/debug/get").get(debug.get);
  // app.route("/api/debug/post").post(debug.post);
};
