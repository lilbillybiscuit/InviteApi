var database = require('../db');
var tools = require('../tools');

exports.get_user_email_settings = async function (request, result) {
  result.json({
    success: true,
    settings: {
      notifyActivityInvolvingMe: tools.getRandomInt(2)==1,
      notifyEventActivity: tools.getRandomInt(2)==1,
      notifyRSVPActivity: tools.getRandomInt(2)==1,
    }
  });
}

exports.set_user_email_settings = async function (request, result) {
  result.json({
    success: true,
    settings: {
      test:1.
    }
  });
}
