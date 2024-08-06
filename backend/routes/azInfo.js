require('dotenv').config();
const { randomUUID } = require("crypto");
const errorLog = require('../helperFunctions/functions').errorLog;
const getLineLocation = require('../functions').getLineLocation;

var db = require('../helperFunctions/dbConfig').dbPool;

exports.getSubscriptions = (req, res) => {
    const sql = "SELECT subscription_name FROM az_subscriptions ORDER BY subscription_name;";
    var lineLocation = getLineLocation();
    db.query(sql, function (err, data, fields) {
        if (!err) {
            res.json({
                data
            })
        } else {
            var error = {
                title: 'Backend server error',
                message: 'Could not retreive Azure subscriptions.',
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = req.authInfo.preferred_username;
            error.action = "List all subscriptions (/az)";
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.query);
            error.location = lineLocation;
            errorLog(error)
        }
    });
}

exports.getRegions = (req, res) => {
    const sql = "SELECT display_name FROM az_regions ORDER BY reg_display_name;";
    var lineLocation = getLineLocation();
    db.query(sql, function (err, data, fields) {
        if (!err) {
            res.json({
                data
            })
        } else {
            var error = {
                title: 'Backend server error',
                message: 'Could not retreive Azure regions.',
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = req.authInfo.preferred_username;
            error.action = "List all regions (/az)";
            error.location = lineLocation;
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.query);
            errorLog(error);
        }
    })
}