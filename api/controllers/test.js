exports.returnSuccess = function (request, result) {
  result.json({
    success: true,
    status: 200,
    message: "Success",
  });

  return;
};

exports.returnError = function (request, result, message) {
  result.status(500).json({
    success: false,
    status: 500,
    message: message,
  });
  return;
};
