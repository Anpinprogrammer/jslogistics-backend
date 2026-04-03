const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(
    fs.readFileSync(path.join(__dirname, "../config/service-account.json"))
  ),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

module.exports = { sheets };