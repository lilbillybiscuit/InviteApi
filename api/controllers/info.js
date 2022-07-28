var config = require("../../config");
var db = require("../db");
var tools = require("../tools");
var accountcollection = db.getdatabase().collection("accounts");

exports.get_info = async function (request, result) {
  if (!request.session.accountid) {
    result.status(299).send({
      success: false,
      title: config.partyInfo.title,
      message: "missing parameter",
    });
    return;
  } else {
    const pipeline = [
      {
        $match: {
          rsvp: {
            $in: ["yes", "no", "maybe"],
          },
        },
      },
      {
        $group: {
          _id: "$rsvp",
          count: { $sum: "$guestCount" },
        },
      },
    ];
    var aggCursor = accountcollection.aggregate(pipeline);
    var tempObj={};
    for await (const doc of aggCursor) {
      tempObj[doc._id] = doc.count;
    }
    result.json({
      success: true,
      title: config.partyInfo.title,
      data: config.partyInfo,
      guestInfo: {
        yes: tempObj["yes"] ?? 0,
        no: tempObj["no"] ?? 0,
        maybe: tempObj["maybe"] ?? 0,
      }
    });
  }
};

exports.get_initial_message = function(request, result) {
  if (!request.session.accountid) {
    result.status(299).send({
      success: false,
      message: "",
    })
    return;
  }
  result.json({
    success: true,
    message: config.partyInfo.initialMessage,
  });
}