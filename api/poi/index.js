// Wrapper to expose the same handler at /api/poi (no .js)
const handler = require('../poi.js');
module.exports = async (req, res) => handler(req, res);
