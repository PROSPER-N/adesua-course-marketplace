const crypto = require("crypto");

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Makes an order reference like "ADS-7K2QXM".
function generateReference() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARACTERS[crypto.randomInt(CHARACTERS.length)];
  }
  return `ADS-${code}`;
}

module.exports = generateReference;
