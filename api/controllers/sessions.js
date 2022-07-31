var database = require("../db");
var tools = require("../tools");
var sessioncollection = database.getdatabase().collection("sessions");
var accountcollection = database.getdatabase().collection("accounts");
var tokencollection = database.getdatabase().collection("tokens");

exports.simpleAuth = async function (request, result) {
  //check if the request contains a token
  if (typeof request.body.token == "undefined") {
    result.send({
      success: false,
      status: 403,
      message: "No token",
    });
    return;
  }
  //Sanitize Token (check hex only and 10 characters)

  //check if the token is valid
  var token = await tokencollection.findOne({ _id: request.body.token });
  if (token === null) {
    result.send({
      success: false,
      status: 403,
      message: "Invalid token",
    });
    return;
  }

  //Assign a new session
  var accountID = tools.generate_string(10);
  var hasFullAccess = true;

  var insertaccount = await accountcollection.insertOne({
    _id: accountID,
    username: "",
    invitedby: token.invitedby,
    rsvp: null,
    email: "",
    name: "",
    allowEmails: false,
    decision: null,
    plusones: [],
    fullAccess: hasFullAccess,
    token: token,
    invitation: [],
    settings: {
      notifyActivityInvolvingMe: false,
      notifyEventActivity: false,
      notifyGuestRSVP: false,
    },
  });
  request.session.accountid = accountID;
  request.session.fullAccess = hasFullAccess;
  result.json({
    success: true,
    status: 200,
    message: "Token verified",
    account: accountID,
  });
};
//Request parameters: "session"
//Return: JSON with an account ID named "account"

exports.get_account_id = async function (request, result) {

  if (!request.session.accountid) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  var accountdetails = await accountcollection.findOne({
    _id: request.session.accountid,
  });
  if (accountdetails === null) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }
  result.json({
    success: true,
    token: accountdetails.token? accountdetails.token._id : null,
    accountid: request.session.accountid,
    fullAccess: request.session.fullAccess ?? false,
  });
};

exports.change_account_username = async function (request, result) {
  if (!request.session.accountid) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }
  if (!("username" in request.body)) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }

  var accountUpdate = await accountcollection.updateOne(
    { _id: request.session.accountid },
    { $set: { username: request.body.username } }
  );
  if (accountUpdate === null) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }

  if (accountUpdate.modifiedCount === 0) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "invalid account",
    });
    return;
  }
  result.json({
    success: true,
    username: request.body.username || request.session.accountid,
  });
};

exports.get_account_username = async function (request, result) {
  if (!request.session.accountid) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  var accountDetails = await accountcollection.findOne({
    _id: request.session.accountid,
  });
  if (accountDetails === null) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }
  result.json({
    success: true,
    accountid: request.session.accountid,
    username: accountDetails.username,
    name: accountDetails.name,
  });
};

exports.change_account = async function (request, result) {
  if (!request.body.accountid) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }

  var accountdetails = await accountcollection.findOne({
    _id: request.body.accountid,
  });

  if (accountdetails === null) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "invalid account",
    });
    return;
  }

  request.session.accountid = request.body.accountid;
  request.session.fullAccess = accountdetails.fullAccess;
  result.json({
    success: true,
    accountid: request.body.accountid,
    fullAccess: accountdetails.fullAccess,
  });
  request.session.save();
  return;
};

exports.check_token_match = async function (request, result) {
  if (!request.session.accountid) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  var accountdetails = await accountcollection.findOne({
    _id: request.session.accountid,
  });

  if (accountdetails === null) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "invalid account",
    });
    return;
  }
  if (accountdetails.token._id === request.body.token) {
    result.json({
      success: true,
      accountid: request.session.accountid,
    })
  } else {
    result.status(401).send({
      success: false,
      status: 400,
      message: "token does not align",
    });
  }
}