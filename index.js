var fetch = require('node-fetch');
const notifier = require('node-notifier');
var cron = require('node-cron');
var moment = require('moment');


var config = require('./conf.json');

const refresh_period = 10;
const url = config.url;

const getCaseDetails = async () => {
    var response = await fetch(url, {
        headers: getHeaders()
    });

    var responseBody = null;
    try {
        responseBody = await response.json();
        printMessage("Fetched update!")
        handleResponse(responseBody);
    } catch (error) {
        printMessage("failed to fetch status update!");
        console.log(error);
        handleError();
    }
}

const handleResponse = (caseUpdate) => {
    const isDecided = caseUpdate.sokande[0].stangandeBeslutDatum !== null;
    const latestEvent = caseUpdate.sokande[0].events[0].eventType;

    const notificationMessage = `Case Decided?: ${isDecided === true ? 'Yes' : 'No'}\nLatest Event: ${latestEvent}`
    notifier.notify(notificationMessage);
}

const handleError = () => {
    notifier.notify("ERROR :(, check the logs!")
}

const getHeaders = () => {
    const cookie = config.cookie;
    const xrfToken = config.token;
     return {
        Cookie: cookie,
        X_XSRF_TOKEN: xrfToken
    }
}

const refreshSession = async () => {
    var response = null;
    try {
        response = await fetch(url, {
            headers: getHeaders()
        })
        printMessage("Session refreshed!")
    } catch (error) {
        console.log("couldn't refresh session ", err)
    }
    
}

const printMessage = (msg) => {
    console.log(`${moment().format("DD-MM-YYYY hh:mm:ss")} -> ${msg}`);
}
getCaseDetails();
cron.schedule(`*/${refresh_period} * * * *`, () => {
    refreshSession();
    getCaseDetails();
});


