var config = require("../config");
const AWS = require("aws-sdk");
const { MongoClient } = require("mongodb");
const client = new MongoClient(config.mongodburl);
const prompt = require("prompt-sync")({sigint: true});
const SES_CONFIG = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
  region: "us-east-2",
};
const AWS_SES = new AWS.SES(SES_CONFIG);

const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
async function run () {
  try {
    await client.connect();
    const database = await client.db("invite");
    const collection = database.collection("accounts");
    const accounts = await collection.find({
      validEmail: true,
      //allowEmails: true,
      rsvp: {$nin: ["no", null]}
    }).toArray();
    accounts.forEach(async account => {
      let params = {
        Source: config.email.source,
        Template: config.email.onedayTemplateName,
        Destination: {
          ToAddresses: [account.email],
        },
        ConfigurationSetName: "gradpartyset",
        TemplateData: JSON.stringify({
          rsvp: capitalizeFirstLetter(account.rsvp),
        }),
      };
      return AWS_SES.sendTemplatedEmail(params).promise();
    });
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }

}
run();