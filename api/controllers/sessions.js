var database = require("../db");
var tools=require("../tools");
var sessioncollection = database.getdatabase().collection("sessions");
var accountcollection = database.getdatabase().collection("accounts");
var tokencollection = database.getdatabase().collection("tokens");

exports.simpleAuth = async function (request, result) {
  //check if the request contains a token
  if (typeof request.headers.token == "undefined") {
    result.send({
      success: false,
      status: 403,
      message: "No token",
    });
    return;
  }
  //Sanitize Token (check hex only and 10 characters)


  //check if the token is valid
  var token = await tokencollection.findOne({ _id: request.headers.token });
  if (token === null) {
    result.send({
      success: false,
      status: 403,
      message: "Invalid token",
    });
    return;
  }

  //Assign a new session
  var sessionID = tools.generate_string(100);
  var ins = await sessioncollection.insertOne({
    _id: sessionID,
    username: "",
    accountID: null,
    invitedby: token.invitedby,
    rsvp: false,
    email: "",
    name: "",
    allowEmails: false,
    decision: null,
    plusones: [],
    invitation: {

    },
    settings: {
      notifyActivityInvolvingMe: false,
      notifyEventActivity: false,
      notifyGuestRSVP: false,
    },

  });


  result.json({
    success: true,
    status: 200,
    message: "Token verified",
    session: sessionID,
  })
  

}

exports.get_name = async function (request, result) {
  result.json({
    success: true,
    name: "John Doe",
  })
}