require("dotenv").config();
const crypto = require('crypto');

module.exports = {
    hashFileURL: function (fileURL, secret) {
        const hash = crypto.createHmac('sha256', secret)
            .update(fileURL)
            .digest('hex');
        return hash;
    },

    addColumnToCSV: function (csvText, newData) {
        csvText = csvText.trim(); // Trim leading/trailing white space (including newlines)
        let lines = csvText.split('\n');
        lines.shift();         // Remove the first line (header)
        const updatedLines = lines.map((line) => {
            line = line.trim();
            const updatedLine = `${line},${newData}`;
            return updatedLine;
        });
        return updatedLines.join('\n');
    }
}