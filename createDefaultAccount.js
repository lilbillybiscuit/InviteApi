const { MongoClient } = require("mongodb");
const config = require("./config");
const client = new MongoClient(config.mongodburl);
const crypto = require("crypto");
const prompt = require("prompt-sync")({sigint: true});
var generate_string = function (len) {
  var token = crypto.randomBytes(Math.ceil((len * 3) / 4)).toString("base64");
  return token.substring(0, len).replaceAll("+", "=").replaceAll("/", "-");
};

const accountID = generate_string(10);
const accountUsername = "mainaccount";

async function run() {
  try {
    await client.connect();

    const database = await client.db("invite");
    const accounts = database.collection("accounts");
    var adminExists = await accounts.findOne({
      admin: true,
    });
    if (adminExists) {
      var answer = prompt("Admin account exists, create another one? [y/n] ");
      if (answer !== "y") {
        console.log("Aborted");
        return;
      }
    }
    var res = await accounts.insertOne({
      _id: accountID,
      username: accountUsername,
      invitedby: null,
      rsvp: null,
      email: "",
      name: "",
      admin: true,
      allowEmails: false,
      decision: null,
      plusones: [],
      invitation: [],
      fullAccess: true,
      settings: {
        notifyActivityInvolvingMe: false,
        notifyEventActivity: false,
        notifyGuestRSVP: false,
      },
    });

    console.log(`Account ID: ${accountID}, username: ${accountUsername}`);
  } catch {
    console.dir();
  } finally {
    client.close();
  }
}

run();
