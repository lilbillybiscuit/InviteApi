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
  var accountID = tools.generate_string(20);
  var hasFullAccess = token.uses == 0;

  var insertaccount = await accountcollection.insertOne({
    _id: accountID,
    username: "",
    invitedby: token.invitedby,
    rsvp: false,
    email: "",
    name: "",
    allowEmails: false,
    decision: null,
    plusones: [],
    fullAccess: hasFullAccess,
    invitation: {
    },
    settings: {
      notifyActivityInvolvingMe: false,
      notifyEventActivity: false,
      notifyGuestRSVP: false,
    },
  });
  request.session.accountid = accountID;
  result.json({
    success: true,
    status: 200,
    message: "Token verified",
    account: accountID,
  })
}
//Request parameters: "session"
//Return: JSON with an account ID named "account"

exports.get_account_from_session = async function (request, result) {
  if (typeof request.headers.session == "undefined") {
    result.status(403).send({
      success: false,
      message: "No account",
    });
    return;
  }
  var session = await sessioncollection.findOne({ _id: request.headers.session });
  if (session === null) {
    result.status(403).send({
      success: false,
      message: "No account",
    });
    return;
  }

  var retAccountID = session.accountID;
  result.json({
    success: true,
    account: retAccountID,
  });
}



exports.get_name = async function (request, result) {
  result.json({
    success: true,
    name: "John Doe",
  })
}

exports.change_account_id = async function (request, result) {

}