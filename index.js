var fetch = require('node-fetch');
const notifier = require('node-notifier');
var cron = require('node-cron');
var config = require('./conf.json');

const getCaseDetails = async () => {
    const url = config.url;
    const cookie = config.cookie;
    const xrfToken = config.token;
    var response = await fetch(url, {
        headers: {
            Cookie: cookie,
            X_XSRF_TOKEN: xrfToken
        }
    });

    var responseBody = null;
    try {
        responseBody = await response.json();
        console.log("Fetched update successfully");
        handleResponse(responseBody);
    } catch (error) {
        console.log("failed to fetch status update!");
        console.log(error);
    }
}

const handleResponse = (caseUpdate) => {
    const isDecided = caseUpdate.sokande[0].stangandeBeslutDatum !== null;
    const latestEvent = caseUpdate.sokande[0].events[0].eventType;

    const notificationMessage = `Case Decided?: ${isDecided === true ? 'Yes' : 'No'}\nLatest Event: ${latestEvent}`
    notifier.notify(notificationMessage);
}

getCaseDetails();
cron.schedule('*/10 * * * *', () => {
    // running every 15 minute
    getCaseDetails();
});


