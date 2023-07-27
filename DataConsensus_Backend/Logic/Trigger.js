const schedule = require('node-schedule');

module.exports = {
    setDeliberation: function (request) {
        const lengthRequest = Number(request.requestTime);
        const lengthOffer = Number(request.offerTime);
        const startTime = new Date(request.deliberationStartTime);
        const requestEndTime = new Date(startTime.getTime() + lengthRequest * 24 * 60 * 60 * 1000);
        const offerEndTime = new Date(requestEndTime.getTime() + lengthOffer * 24 * 60 * 60 * 1000);
        const job = schedule.scheduleJob(requestEndTime, () => {
            // Perform the action here
            console.log('Action triggered on', requestEndTime);
        });
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


