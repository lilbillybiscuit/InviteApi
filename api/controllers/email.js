var config = require("../../config");
const AWS = require("aws-sdk");
var db = require("../db");
var tools = require("../tools");
var accountcollection = db.getdatabase().collection("accounts");
const SES_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: "us-east-2",
};
const AWS_SES = new AWS.SES(SES_CONFIG);
exports.send_confirmation = async function (data) {
  if (
    !data.name ||
    !data.email ||
    !data.accountid ||
    !data.rsvp ||
    !data.guestCount
  ) {
    return false;
  }
  var accountID = data.accountid;
  var accountDetails = await accountcollection.findOne({
    _id: accountID,
  });
  if (accountDetails === null) {
    return false;
  }
  if (!accountDetails.validEmail || !accountDetails.allowEmails) return false; //don't respond to invalid emails

  let params = {
    Source: config.email.source,
    Template: config.email.confirmationTemplateName,
    Destination: {
      ToAddresses: [data.email],
    },
    TemplateData: JSON.stringify({
      name: data.name,
      rsvp: tools.capitalizeFirstLetter(data.rsvp),
      guestCount: data.guestCount==1? "1 guest": data.guestCount+" guests",
      accountid: data.accountid,
    }),
  };
  return AWS_SES.sendTemplatedEmail(params).promise();
};
//This should only be called from a Lambda function (like one subscribed to an SNS topic)
exports.bounce_email = async function (request, result) {
  if (!request.params.token || !request.body.email) {
    result.status(400).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  if (request.params.token !== config.email_control_key) {
    result.status(400).send({
      success: false,
      status: 400,
      message: "invalid token",
    });
    return;
  }
  var email = request.body.email;
  var updateAccount = await accountcollection.update(
    {
      _id: email,
    },
    {
      $set: {
        allowEmails: false,
      },
    }
  );
  if (updateAccount.modifiedCount === 0) {
    result.status(400).send({
      success: false,
      status: 400,
      message: "invalid account",
    });
    return;
  }
  result.json({
    success: true,
    status: 200,
    message: "email invalidated",
  });
};

exports.complaint_email = async function (request, result) {
  if (!request.params.token || !request.body.email) {
    result.status(400).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  if (request.params.token !== config.email_control_key) {
    result.status(400).send({
      success: false,
      status: 400,
      message: "invalid token",
    });
    return;
  }
  var email = request.body.email;
  var updateAccount = await accountcollection.update(
    {
      _id: email,
    },
    {
      $set: {
        allowEmails: false,
      },
    }
  );
  if (updateAccount.modifiedCount === 0) {
    result.status(400).send({
      success: false,
      status: 400,
      message: "invalid account",
    });
    return;
  }
  result.json({
    success: true,
    status: 200,
    message: "email invalidated",
  });
};
