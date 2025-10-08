const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const debugInfo = {
      __dirname: __dirname,
      "process.cwd()": process.cwd(),
      "files in __dirname": [],
      "files in process.cwd()": [],
      "listings file exists": false,
      "listings count": 0
    };

    try {
      debugInfo["files in __dirname"] = fs.readdirSync(__dirname);
    } catch (e) {
      debugInfo["files in __dirname"] = `Error: ${e.message}`;
    }

    try {
      debugInfo["files in process.cwd()"] = fs.readdirSync(process.cwd());
    } catch (e) {
      debugInfo["files in process.cwd()"] = `Error: ${e.message}`;
    }

    const listingsPath = path.join(__dirname, "listings.json");
    debugInfo["listings file exists"] = fs.existsSync(listingsPath);

    if (debugInfo["listings file exists"]) {
      try {
        const listings = JSON.parse(fs.readFileSync(listingsPath, "utf8"));
        debugInfo["listings count"] = listings.length;
      } catch (e) {
        debugInfo["listings error"] = e.message;
      }
    }

    res.status(200).json(debugInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};