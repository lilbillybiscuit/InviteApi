var database = require("./db").getdatabase();
var sessioncollection = database.collection("sessions");
var accountcollection = database.collection("accounts");
var metadatacollection = database.collection("metadata");
const crypto = require("crypto");

exports.verify_token2 = async function (token) {
  if (typeof token == "undefined") {
    return {
      success: false,
      ret: {
        success: false,
        message: "Not logged in",
      },
    };
  }
  var verify = this.verify_token(token);
  if (!verify.success) {
    return {
      success: false,
      ret: {
        success: false,
        message: "Invalid token",
      },
    };
  }
  return {
    success: true,
    message: "Token verified",
    access_level: verify.access_level,
    username: verify.username,
  };
};

exports.verify_token = async function (token) {
  if (token.length != 10) {
    return {
      success: false,
      message: "Invalid token",
    };
  }
  var session = await sessioncollection.findOne({ token: token });
  if (session === null) {
    return {
      success: false,
      message: "Invalid token",
    };
  }
  if (session.expires < Date.now()) {
    await sessioncollection.deleteOne({ token: token });
    return {
      success: false,
      message: "Token expired",
    };
  }
  return {
    success: true,
    access_level: session.access_level,
    username: session.username,
  };
};

exports.get_user_data = async function (username) {
  return await accountcollection.findOne({ username: username });
};

exports.new_token = async function (accountobj) {
  var token = this.generate_string(100);
  var expires = this.get_expires(2400); //Expires in 12 hours
  if (accountobj === null) {
    return {
      success: false,
      message: "Invalid username",
      token: "",
      access_level: 0,
      expires: new Date(),
    };
  }
  var access_level;
  if (accountobj.role == "admin") access_level = 10;
  else if (accountobj.role == "moderator") access_level = 5;
  else access_level = 1;

  var session = {
    token: token,
    expires: expires,
    access_level: access_level,
    username: accountobj._id,
  };

  await sessioncollection.insertOne(session);
  return { token: token, expires: expires, access_level: access_level };
};
exports.new_token_test = async function (username) {
  var token = this.generate_string(100);
  var expires = this.get_expires(12); //Expires in 12 hours
  var session = {
    token: token,
    expires: expires,
    access_level: 10,
    username: username,
  };
  await sessioncollection.insertOne(session);
  return session;
};
exports.generate_string = function (len) {
  var token = crypto.randomBytes(Math.ceil((len * 3) / 4)).toString("base64");
  token = token.substring(0, len).replaceAll("+", "=").replaceAll("/", "-");
  return "0" + token.substring(1);
};

exports.generate_token_hex = function(len) {
  var str = this.generate_hex(len);
  return "0"+str.substring(1);
}

exports.generate_hex = function (len) {
  var token = crypto.randomBytes(Math.ceil(len / 2)).toString("hex");
  return token.substring(0, len);
};
exports.get_expires = function (hours_ahead) {
  var today = new Date();
  today.setHours(today.getHours() + hours_ahead);
  return today;
};

exports.get_counter_and_update = async function (id) {
  var counter = await metadatacollection.findOneAndUpdate(
    { _id: id },
    { $inc: { counter: 1 } },
    { returnNewDocument: true, upsert: true }
  );

  // if (counter.value === null) {
  //     await metadatacollection.insertOne({_id:id, counter:0});
  //     counter = await metadatacollection.findOneAndUpdate({_id:id},{$inc: {counter:1}},{returnNewDocument: true, upsert: true});
  // }
  if (counter.value === null) return 0;
  else return counter.value.counter;
};
exports.get_counter = async function (id) {
  var counter = await metadatacollection.findOne({ _id: id });
  if (counter === null) return 0;
  else return counter.counter;
};

exports.getRandomInt = function (max) {
  return Math.floor(Math.random() * max);
};

exports.check_not_string = function () {
  for (var i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] !== "string") return false;
  }
  return true;
};

exports.check_not_null = function () {
  for (var i = 0; i < arguments.length; i++) {
    if (arguments[i] === null) {
      return false;
    }
  }
  return true;
};

exports.check_letters_only = function (str) {
  return /^[A-Za-z\s]*$/.test(str); //Only letters and spaces
};

exports.capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}