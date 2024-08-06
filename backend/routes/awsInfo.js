require('dotenv').config();
const { randomUUID } = require("crypto");
const errorLog = require('../helperFunctions/functions').errorLog;
const getLineLocation = require('../functions').getLineLocation;

var db = require('../helperFunctions/dbConfig').dbPool;

exports.getAccounts = (req, res) => {
    const sql = "SELECT account_name FROM aws_accounts ORDER BY account_name;";
    var lineLocation = getLineLocation();
    db.query(sql, function (err, data, fields) {
        if (!err) {
            res.json({
                data
            })
        } else {
            var error = {
                title: 'Backend server error',
                message: 'Could not retreive AWS accounts.',
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = req.authInfo.preferred_username;
            error.action = "List all accounts (/aws)";
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.query);
            error.location = lineLocation;
            errorLog(error)
        }
    });
}

exports.getRegions = (req, res) => {
    const sql = "SELECT aws_name FROM aws_regions ORDER BY friendly_name;";
    var lineLocation = getLineLocation();
    db.query(sql, function (err, data, fields) {
        if (!err) {
            res.json({
                data
            })
        } else {
            var error = {
                title: 'Backend server error',
                message: 'Could not retreive AWS regions.',
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = req.authInfo.preferred_username;
            error.action = "List all regions (/aws)";
            error.location = lineLocation;
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.query);
            errorLog(error);
        }
    })
}
exports.getAZs = async (req, res) => {
    try {
        var lineLocation = getLineLocation();
        const region = req.query.region;
        const sql = `SELECT az FROM aws_azs WHERE region = '${region}' ORDER BY az;`

        db.query(sql, function (err, data, fields) {
            if (!err) {
                res.json({
                    data
                })
            } else {
                var error = {
                    title: 'Backend server error',
                    message: 'Could not retreive availability zones.',
                    errorID: randomUUID()
                }
                res.statusCode = 501;
                res.json({
                    error: error
                })
                error.details = err;
                error.userEmail = req.authInfo.preferred_username;
                error.action = "List all availability zones (/aws)";
                error.originalUrl = req._parsedUrl.pathname;
                error.requestParams = JSON.stringify(req.query);
                error.location = lineLocation;
                errorLog(error)
            }
        })
    } catch (err) {
        var error = {
            title: 'Backend server error',
            message: 'Undefined error. If the issue persists, contact your administrator.',
            errorID: randomUUID()
        }
        res.statusCode = 501;
        res.json({
            error: error
        })
        error.details = err;
        error.userEmail = req.authInfo.preferred_username;
        error.action = "List all regions (/aws)";
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.query);
        error.location = lineLocation;
        errorLog(error)
    }

}