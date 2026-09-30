// Makes search text safe to use in a regular expression: characters like "(" or "*"
// are matched as plain text, so they can't break the query or slow it down.
// Example: new RegExp(escapeRegex(search), "i") matches the text anywhere, ignoring capitals.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = escapeRegex;
