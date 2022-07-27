exports.get = function (request, result) {
  console.log(request);
  result.json({
    success: true,
  })
}

exports.post = function (request, result) {
  console.log(request);
  result.json({
    success: true,
  })
}