exports.get = function (request, result) {
  console.log(request.params);
  console.log(JSON.stringify(request.body));
  result.json({
    success: true,
  })
}

exports.post = function (request, result) {
  console.log(request.params);
  console.log(JSON.stringify(request.body));
  result.json({
    success: true,
  })
}