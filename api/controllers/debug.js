exports.get = function (request, result) {
  console.log(request.params);
  console.log(request.body);
  result.json({
    success: true,
  })
}

exports.post = function (request, result) {
  console.log(request.params);
  console.log(request.body);
  result.json({
    success: true,
  })
}