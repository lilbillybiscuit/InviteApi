const database = require("../db");
const tools = require("../tools");
const config = require("../../config");
const tokencollection = database.getdatabase().collection("tokens");
const sessioncollection = database.getdatabase().collection("sessions");
const accountcollection = database.getdatabase().collection("accounts");
const guestcollection = database.getdatabase().collection("guests");
//If authorized
// generate a new token
exports.create_valid_token = async function (request, result) {
  var useSecret = false;
  if ("adminsecret" in request.body) {
    if (request.body.adminsecret != config.initialSecretKey) {
      result.status(204).send({
        success: false,
        status: 400,
        message: "missing parameter",
      });
      return;
    }
    useSecret = true;
  } else {
    if (!request.session.accountid) {
      result.status(204).send({
        success: false,
        status: 400,
        message: "missing parameter",
      });
      return;
    }
  }
  console.log(request.body);
  if (!request.body.intendedfor) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "A name must be assigned to this token",
    });
    return;
  }
  var data = useSecret ? { admin: true } : { _id: request.session.accountid };
  var accountDetails = await accountcollection.findOne(data);
  if (accountDetails === null) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "invalid account",
    });
    return;
  }
  if (!accountDetails.fullAccess) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "Account does not have full access",
      short: "LimitedAccess",
    });
    return;
  }
  var token = tools.generate_token_hex(10);
  while (await tokencollection.findOne({ _id: token })) {
    token = tools.generate_token_hex(10);
  }
  var inserttoken = await tokencollection.insertOne({
    _id: token,
    invitedby: {
      username: accountDetails.username,
      accountID: accountDetails._id,
    },
    intendedfor: request.body.intendedfor,
    created: new Date(),
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
    shareUrl: config.websiteUrl + "/" + token,
  });
};

exports.delete_token = async function (request, result) {
  if (!request.session.accountid || !request.session.fullAccess) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  if (!("token" in request.body)) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  var token = await tokencollection.findOne({ _id: request.body.token });
  if (token === null) {
    result.status(204).send({
      success: false,
      status: 400,
      message: "invalid token",
    });
    return;
  }
  var deleteToken = await tokencollection.deleteOne({
    _id: request.body.token,
  });

  var accountDetails = await accountcollection.updateOne(
    {
      _id: request.session.accountid,
    },
    {
      $pull: {
        invitation: request.body.token,
      },
    }
  );
  result.send({
    success: true,
    status: 200,
    message: "Success",
  });
};
