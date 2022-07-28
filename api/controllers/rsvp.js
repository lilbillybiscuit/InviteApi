var database = require("../db");
var tools = require("../tools");
var sessioncollection = database.getdatabase().collection("sessions");
var accountcollection = database.getdatabase().collection("accounts");
var tokencollection = database.getdatabase().collection("tokens");
var arrivaltimecollection = database.getdatabase().collection("arrivaltimes");
var activitycollection = database.getdatabase().collection("activity");
var rsvpcollection = database.getdatabase().collection("rsvp");
var validator = require("validator");
var config = require("../../config");
var moment = require("moment");
var emailHandler = require("./email");
// Request body should include:
// rsvp: 'yes', 'no','maybe' (and nothing else)
// name: string
// email: string
// allowEmails: boolean
// arrivalStart: integer
// arrivalEnd: integer
// optionalComments: string (large)
const PARTY_START = moment(new Date(config.partyInfo.partyStart));
const PARTY_END = moment(new Date(config.partyInfo.partyEnd));
const PARTY_DURATION = PARTY_END.diff(PARTY_START, "minutes");
exports.getCurrentRSVP = async function (request, result) {
  if (!request.session.accountid) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  var accountID = request.session.accountid;
  var accountDetails = await accountcollection.findOne({
    _id: accountID,
  });

  if (accountDetails === null) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }
  if (accountDetails.rsvp === null) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "You have not RSVP'd yet",
    });
    return;
  }
  result.json({
    success: true,
    data: {
      rsvp: accountDetails.rsvp ?? null,
      name: accountDetails.name ?? "",
      email: accountDetails.email ?? "",
      waterfight: accountDetails.waterfight ?? false,
      allowEmails: accountDetails.allowEmails ?? false,
      arrivalStart: accountDetails.arrivalStart,
      arrivalEnd: accountDetails.arrivalEnd,
      optionalComments: accountDetails.optionalComments ?? "",
      guestCount: accountDetails.guestCount ?? 1,
    },
  });
};

exports.RSVP = async function (request, result) {
  if (!request.session.accountid) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  var accountID = request.session.accountid;
  var accountDetails = await accountcollection.findOne({
    _id: accountID,
  });
  if (accountDetails === null) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }

  var rsvpType = accountDetails.rsvp ? "update" : "create";
  if (
    !tools.check_not_null(
      request.body.rsvp,
      request.body.name,
      request.body.email,
      request.body.allowEmails,
      request.body.arrivalStart,
      request.body.arrivalEnd,
      request.body.optionalComments
    )
  ) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  if (
    !tools.check_not_string(
      request.body.rsvp,
      request.body.name,
      request.body.email,
      request.body.optionalComments
    )
  ) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "invalid parameter 2",
    });
    return;
  }
  if (
    typeof request.body.arrivalStart !== "number" ||
    typeof request.body.arrivalEnd !== "number" ||
    typeof request.body.guestCount !== "number"
  ) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "invalid parameter 3",
    });
    return;
  }
  var data = request.body;
  var rsvp = data.rsvp;
  var name = data.name;
  var email = data.email;
  var allowEmails = data.allowEmails;
  var arrivalStart = data.arrivalStart;
  var arrivalEnd = data.arrivalEnd;
  var optionalComments = data.optionalComments;
  var validRequest = true;
  var guestCount = data.guestCount;
  if (rsvp !== "yes" && rsvp !== "no" && rsvp !== "maybe") validRequest = false;

  if (!/^[A-Za-z\s]+$/.test(name)) validRequest = false;
  if (!validator.isEmail(email)) validRequest = false;
  if (typeof allowEmails !== "boolean") validRequest = false;
  if (
    rsvp !== "no" &&
    (0 > arrivalStart ||
      arrivalStart > arrivalEnd ||
      arrivalEnd > PARTY_DURATION)
  )
    validRequest = false;

  if (typeof optionalComments !== "string") validRequest = false;
  if (typeof data.waterfight !== "boolean") validRequest = false;
  if (guestCount < 1 || guestCount > 5) validRequest = false;
  if (!validRequest) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "invalid parameter 3",
    });
    return;
  }

  var newAccount = {
    rsvp: rsvp,
    name: name,
    email: email,
    allowEmails: allowEmails,
    arrivalStart: arrivalStart,
    arrivalEnd: arrivalEnd,
    optionalComments: optionalComments,
    waterfight: data.waterfight ?? false,
    validEmail: true,
    guestCount: guestCount,
  };
  var accountUpdate = await accountcollection.updateOne(
    { _id: accountID },
    { $set: newAccount },
    { upsert: true }
  );
  if (accountUpdate.matchedCount === 0) {
    result.status(204).send({
      success: false,
      message: "failed to update account",
    });
    return;
  }
  if ("token" in accountDetails && "_id" in accountDetails.token) {
    var tokenUpdate = await tokencollection.updateOne(
      { _id: accountDetails.token._id },
      {
        $set: {
          activated: true,
        },
      }
    );
  }
  if (allowEmails && rsvpType==="create") {
    emailHandler.send_confirmation({
      name: name,
      email: email,
      accountid: accountID,
      rsvp: rsvp,
      guestCount: guestCount,
    });
    console.log("sent email");
  }

  result.json({
    success: true,
    message: "RSVP updated",
  });
};
