const fs = require('fs');
const resolve = require('path').resolve;
var getAbsLogPath = require('./env').getAbsLogPath;

exports.formatDate = (date) => {
  let dayOfMonth = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hour = date.getHours();
  let minutes = date.getMinutes();
  let diffMs = new Date() - date;
  let diffSec = Math.round(diffMs / 1000);
  let diffMin = diffSec / 60;
  let diffHour = diffMin / 60;

  // formatting
  year = year.toString();
  month = month < 10 ? '0' + month : month;
  dayOfMonth = dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth;
  hour = hour < 10 ? '0' + hour : hour;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  if (diffSec < 1) {
    return 'right now';
  } else if (diffMin < 1) {
    return `${Math.round(diffSec)} sec. ago`
  } else if (diffHour < 1) {
    return `${Math.round(diffMin)} min. ago`
  } else {
    return `${dayOfMonth}.${month}.${year} ${hour}:${minutes}`
  }
}

exports.errorLog = (error) => {
  try {
    console.log(error);
    const logRootFolder = getAbsLogPath();

    if (!fs.existsSync(logRootFolder)) {
      fs.mkdirSync(logRootFolder)
    }
    const date = new Date();
    let year = date.getFullYear().toString();
    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let dayOfMonth = date.getDate();
    dayOfMonth = dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth;
    let logFileName = `${year}${month}${dayOfMonth}-error.log`
    const logFile = `${logRootFolder}/${logFileName}`

    currentTime = date.toString();
    let logText = `${currentTime}\n` +
      `   ID: ${error.errorID}\n` +
      `   Title: ${error.title}\n` +
      `   Message: ${error.message}\n` +
      `   Details:\n` +
      `     User: ${error.userEmail}\n` +
      `     Action: ${error.action}\n` +
      `     Requested URL: ${error.originalUrl}\n` +
      `     Related Params:\n       ${error.requestParams}\n` +
      `     Code Location: ${error.location}\n` +
      `     STDERR: ${error.details}\n`
    fs.appendFileSync(logFile, logText, (err) => { return err })

  } catch (error) {
    console.log(error);
  }
}

exports.authLog = (error) => {
  try {
    console.log(error);
    const logRootFolder = getAbsLogPath();

    if (!fs.existsSync(logRootFolder)) {
      fs.mkdirSync(logRootFolder)
    }
    const date = new Date();
    let year = date.getFullYear().toString();
    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let dayOfMonth = date.getDate();
    dayOfMonth = dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth;
    let logFileName = `${year}${month}${dayOfMonth}-auth.log`
    const logFile = `${logRootFolder}/${logFileName}`

    currentTime = date.toString();
    let logText = `${currentTime}\n` +
      `   ID: ${error.errorID}\n` +
      `   Title: ${error.title}\n` +
      `   Message: ${error.message}\n` +
      `   Details:\n` +
      `     User: ${error.userEmail}\n` +
      `     Action: ${error.action}\n` +
      `     Requested URL: ${error.originalUrl}\n` +
      `     Related Params:\n       ${error.requestParams}\n` +
      `     Code Location: ${error.location}\n` +
      `     STDERR: ${error.details}\n`
    fs.appendFileSync(logFile, logText, (err) => { return err })

  } catch (error) {
    console.log(error);
  }
}

exports.loginLog = (log) => {
  try {
    console.log(log)
    const logRootFolder = getAbsLogPath();

    if (!fs.existsSync(logRootFolder)) {
      fs.mkdirSync(logRootFolder)
    }
    const date = new Date();
    let year = date.getFullYear().toString();
    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month : month;
    let dayOfMonth = date.getDate();
    dayOfMonth = dayOfMonth < 10 ? '0' + dayOfMonth : dayOfMonth;
    let logFileName = `${year}${month}${dayOfMonth}-login.log`
    const logFile = `${logRootFolder}/${logFileName}`

    currentTime = date.toString();
    let logText = `${currentTime}\n` +
      `   ID: ${log.id}\n` +
      `   Login: ${log.error === "None" ? "Success" : "Failed"}\n` +
      `   Details:\n` +
      `     Email: ${log.userEmail}\n` +
      `     Name: ${log.userName}\n` +
      `     IP: ${log.ip}\n` +
      `     Admin: ${log.isAdmin}\n` +
      `     Error: ${log.error}\n`
    fs.appendFileSync(logFile, logText, (err) => { return err })

  } catch (error) {
    console.log(error);
  }
}