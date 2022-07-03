var database = require('../db');
var tools = require('../tools');

const tokencollection = database.getdatabase().collection('tokens');
const sessioncollection = database.getdatabase().collection('sessions');
const accountcollection = database.getdatabase().collection('accounts');


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
