var config = require("../../config");
exports.getWifi = function (request, result) {
  if (request.session.fullAccess) {
    result.json({
      success: true,
      wifi: {
        ssid: config.wifi.ssid,
        password: config.wifi.password
      }
    });
  } else {
    result.send({
      success: false,
      wifi: {
        ssid: config.wifi.ssid,
        password: "--"
      }
    });
  }
}