var database = require("../db");
var tools = require("../tools");
var accountcollection = database.getdatabase().collection("accounts");
var sessioncollection = database.getdatabase().collection("sessions");
var tokencollection = database.getdatabase().collection("tokens");
var config = require("../../config");
exports.getFullGuestList = async function (request, result) {
  if (!request.session.fullAccess) {
    result.status(400).json({
      success: false,
      message: "Your session does not have access to this resource.",
    });
    return;
  }
  var accountDetails = await accountcollection.findOne({
    _id: request.session.accountid,
  });
  if (accountDetails === null) {
    result.status(400).json({
      success: false,
      message: "Your session does not have access to this resource.",
    });
    return;
  }
  result.json({
    success: true,
    guests: (await guestListOnly()).concat(
      await guestListPending(accountDetails)
    ),
  });
};

async function guestListOnly() {
  var accountcache = {};
  var guestList = await accountcollection
    .find({
      rsvp: {
        $ne: null,
      },
    })
    .toArray();
  var ret = [];
  for (var i = 0; i < guestList.length; i++) {
    var elem = guestList[i];

    var temp = {
      id: tools.generate_string(10),
      name: elem.name,
      shareLink: "Used",
      created: elem.tokencreated ?? new Date(2022, 6, 1), //July 1, 2022
      rsvp: elem.rsvp,
      actions: true,
    };
    if (!elem.invitedby) {
      temp.invitedby = "Unknown";
      ret.push(temp);
      continue;
    }
    if (elem.invitedby.accountID in accountcache) {
      temp.invitedby = accountcache[elem.invitedby.accountID];
    } else {
      var tempAcc = await accountcollection.findOne({
        _id: elem.invitedby.accountID
      });
      if (tempAcc === null) {
        temp.invitedby = "Unknown";
      } else {
        temp.invitedby = tempAcc.name;
      }
      accountcache[elem.invitedby.accountID] = temp.invitedby;
    }
    ret.push(temp);
  }
  return ret;
}
exports.getGuestListOnly = async function (request, result) {
  if (!request.session.fullAccess) {
    result.status(400).json({
      success: false,
      message: "Your session does not have access to this resource.",
    });
    return;
  }

  var ret = {
    success: true,
    guests: await guestListOnly(),
  };
  result.json(ret);
};

async function guestListPending(account) {
  var pendingList = await tokencollection
    .find({
      uses: {
        $lt: 5,
      },
      "invitedby.accountID": account._id,
      activated: { $ne: true },
    })
    .toArray();
  return pendingList.map((elem) => {
    console.log(elem);
    return {
      id: elem._id,
      name: elem.intendedfor,
      shareLink: `${config.websiteUrl}/${elem._id}`,
      created: elem.created,
      rsvp: null,
      invitedby: account.name || "Nobody",
      actions: false,
    };
  });
}
exports.getGuestListPending = async function (request, result) {
  if (!request.session.fullAccess) {
    result.status(400).json({
      success: false,
      message: "Your session does not have access to this resource.",
    });
    return;
  }
  var accountDetails = await accountcollection.findOne({
    _id: request.session.accountid,
  });
  if (accountDetails === null) {
    result.status(400).json({
      success: false,
      message: "Your session does not have access to this resource.",
    });
    return;
  }

  var ret = {
    success: true,
    guests: guestListPending(accountDetails),
  };
  result.json(ret);
};

exports.getPartyInfo = function (request, result) {
  if (!request.session.accountid) {
    result.status(400).json({
      success: false,
      message: "Invalid Session",
    });
    return;
  }
};
