var fs = require("fs");

var file = fs.readFileSync("./confirmtemplate.html", "utf8");

var ret = {
  Template: {
    TemplateName: "InviteApiConfirmation",
    "SubjectPart": "Thanks for RSVPing, {{name}}!",
    HtmlPart: file,
    TextPart: "Hello {{name}}, thanks for RSVPing! You RSVPed {{rsvp}} for {{guestCount}}. For future reference, your account ID is {{accountid}}."
  }
}

ret = JSON.stringify(ret);

fs.writeFileSync("./ses_confirmtemplate.json", ret);