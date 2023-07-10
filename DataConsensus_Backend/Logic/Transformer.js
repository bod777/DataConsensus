require("dotenv").config();
const crypto = require('crypto');
const secret = process.env.SECRET;

module.exports = {
    hashFileURL: function (fileURL) {
        const hash = crypto.createHmac('sha256', secret)
            .update(fileURL)
            .digest('hex');
        return hash;
    },

    addColumnToCSV: function (csvText, newData) {
        const lines = csvText.split('\n');

        const updatedLines = lines.map((line) => {
            const updatedLine = `${line},${newData}`;
            return updatedLine;
        });

        return updatedLines.join('\n');
    }
}