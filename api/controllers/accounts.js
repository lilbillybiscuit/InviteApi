const database = require("../db");
const tools = require("../tools");
const config = require("../../config");
const tokencollection = database.getdatabase().collection("tokens");
const sessioncollection = database.getdatabase().collection("sessions");
const accountcollection = database.getdatabase().collection("accounts");
//If authorized
// generate a new token
exports.create_valid_token = async function (request, result) {
  if ("adminsecret" in request.body) {
    if (request.body.adminsecret != config.initialSecretKey) {
      result.status(403).send({
        success: false,
        status: 400,
        message: "missing parameter",
      });
    }
  } else {
    if (!request.session.accountid) {
      result.status(403).send({
        success: false,
        status: 400,
        message: "missing parameter",
      });
    }
  }

  var accountDetails = await accountcollection.findOne({
    _id: request.session.accountid,
  });
  if (accountDetails === null) {
    result.status(403).send({
      success: false,
      status: 400,
      message: "invalid accountid",
    });
    return;
  }
  if (!accountDetails.fullAccess) {
    result.status(403).send({
      success: false,
      status: 400,
      message: "Account does not have full access",
      short: "LimitedAccess",
    });
    return;
  }
  var token = tools.generate_hex(10);
  while (await tokencollection.findOne({ _id: token })) {
    token = tools.generate_hex(10);
  }
  var inserttoken = await tokencollection.insertOne({
    _id: token,
    invitedby: {
      username: accountDetails.username,
      accountID: accountDetails._id,
    },
    uses: 0,
  });
  var insertTokenInAccount = await accountcollection.updateOne(
    { _id: request.session.accountid },
    {
      $push: {
        invitation: token,
      },
    }
  );
  result.send({
    success: true,
    status: 200,
    message: "Success",
    token: token,
    shareUrl: config.baseUrl + "/" + token,
  });
};
