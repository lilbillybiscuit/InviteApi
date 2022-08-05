const moment = require("moment");
const config = require("../../config");
const GALLERY_START = moment(new Date(config.gallery.starttime));

exports.currentGalleryTime = async function (request, result) {
  if (!request.session.accountid) {
    result.status(401).send({
      success: false,
      status: 400,
      message: "missing parameter",
    });
    return;
  }
  result.json({
    success: true,
    time: moment().diff(GALLERY_START),
    m3u8: config.gallery.m3u8url,
  });
}
