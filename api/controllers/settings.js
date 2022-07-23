var database = require("../db");
var tools = require("../tools");

const tokencollection = database.getdatabase().collection("tokens");
const sessioncollection = database.getdatabase().collection("sessions");
const accountcollection = database.getdatabase().collection("accounts");

exports.get_user_email_settings = async function (request, result) {
  if (!request.session.accountid) {
    result.status(400).send({
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
    result.status(400).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }

  result.json({
    success: true,
    settings: {
      notifyActivityInvolvingMe:
        accountDetails.settings.notifyActivityInvolvingMe ?? false,
      notifyEventActivity: accountDetails.settings.notifyEventActivity ?? false,
      notifyRSVPActivity: accountDetails.settings.notifyGuestRSVP ?? false,
    },
  });
};

// notifyActivityInvolvingMe, notifyEventActivity, notifyRSVPActivity must be in body

exports.set_user_email_settings = async function (request, result) {
  if (!request.session.accountid) {
    result.status(400).send({
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
    result.status(400).send({
      success: false,
      status: 400,
      message: "invalid session",
    });
    return;
  }
  var updateQuery = {
    $set: {}
  };
  var retObject = {

  }
  if ("notifyActivityInvolvingMe" in request.body) {
    updateQuery.$set["settings.notifyActivityInvolvingMe"] =
      request.body.notifyActivityInvolvingMe;
    retObject.notifyActivityInvolvingMe = request.body.notifyActivityInvolvingMe;
  }
  if ("notifyEventActivity" in request.body) {
    updateQuery.$set["settings.notifyEventActivity"] =
      request.body.notifyEventActivity;
    retObject.notifyEventActivity = request.body.notifyEventActivity;
  }
  if ("notifyGuestRSVP" in request.body) {
    updateQuery.$set["settings.notifyGuestRSVP"] = request.body.notifyGuestRSVP;
    retObject.notifyGuestRSVP = request.body.notifyGuestRSVP;
  }
  var updateResult = await accountcollection.updateOne(
    { _id: request.session.accountid },
    updateQuery
  );
  if (updateResult.matchedCount === 0) {
    result.status(400).send({
      success: false,
      status: 400,
      message: "Something went wrong",
    });
    return;
  }

  result.json({
    success: true,
    settings: retObject
  });
};
