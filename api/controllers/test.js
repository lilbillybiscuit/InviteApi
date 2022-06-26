exports.returnSuccess = async function (request, result) {
  setTimeout(() => {
    result.json({
      success: true,
      status: 200,
      message: "Success",
    });
  }, 500);

  return;
};

exports.returnError = async function (request, result, message) {
  setTimeout(() => {
    result.status(500).json({
      success: false,
      status: 500,
      message: message,
    });
  }, 500);
  return;
};
