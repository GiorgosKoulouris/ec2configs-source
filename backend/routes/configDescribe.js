var fs = require('fs');

var getAbsDataPath = require('../helperFunctions/env').getAbsDataPath;
const absDataPath = getAbsDataPath();
const azAdminGroupID = process.env.AZ_ADMIN_GRP_ID;

const { randomUUID } = require("crypto");
const errorLog = require('../helperFunctions/functions').errorLog;
const authLog = require('../helperFunctions/functions').authLog;
const getLineLocation = require('../functions').getLineLocation;

var db = require('../helperFunctions/dbConfig').dbPool;

exports.configDescribe = async (req, res) => {
    let userEmail = req.authInfo.preferred_username;
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;
    let canView = false;
    let configUUID = req.query.configUUID;
    let provider = "";
    if (req.query.provider === "AWS") {
        provider = "aws"
    } else {
        provider = "az"
    }


    try {
        let sql = `SELECT config_uuid FROM configs WHERE (\
            ( owner_email = "${userEmail}" AND config_uuid = "${configUUID}" )\
            OR\
            ( config_uuid IN ( SELECT config_uuid FROM config_shares WHERE ( config_uuid = "${configUUID}" AND share_type = "User" AND target_id = "${userEmail}" ))\
            OR\
            ( config_uuid IN ( SELECT config_uuid FROM config_shares WHERE\
               ( config_uuid = "${configUUID}" AND share_type = "Group" AND target_id IN ( SELECT group_name FROM user_group_assignments WHERE user_email = "${userEmail}" ))\
            ) )\
            ));`;

        let sharedCount = await new Promise((resolve) => {
            var lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (!err) {
                    resolve(data.length)
                } else {
                    var error = {
                        title: 'Backend server error',
                        message: "Failed to determine if this config is shared with the active user.",
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "Validate that config is shared with user (/configs)";
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    error.location = lineLocation;
                    errorLog(error)
                }
            })
        })

        if (isAdmin || sharedCount > 0) {
            canView = true;
        }

        if (!canView) {
            let lineLocation = getLineLocation();
            var error = {
                title: 'Not enough permissions',
                message: "Please contact the config's onwer or an app administrator.",
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = "User requested view to a config that they have no access.";
            error.userEmail = req.authInfo.preferred_username;
            error.action = "View config (/configs)";
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.query);
            error.location = lineLocation;
            authLog(error);

        } else {
            const configFolder = `${absDataPath}/${configUUID}`;
            const jsonConfigFolder = `${configFolder}/json`;

            if (provider === "aws") {
                const vpcJsonFile = `${jsonConfigFolder}/vpcConfig.json`;
                const subnetJsonFile = `${jsonConfigFolder}/subnetConfig.json`;
                const peeringsJsonFile = `${jsonConfigFolder}/peeringsConfig.json`;
                const gatewayJsonFile = `${jsonConfigFolder}/gatewaysConfig.json`;
                const vpnConnJsonFile = `${jsonConfigFolder}/vpnConnectionsConfig.json`;
                const routeTableJsonFile = `${jsonConfigFolder}/routeTablesConfig.json`;

                let jsonConfig = {};

                try {
                    var lineLocation = getLineLocation();
                    jsonConfig.vpcs = JSON.parse(fs.readFileSync(vpcJsonFile, 'utf8'));
                    jsonConfig.subnets = JSON.parse(fs.readFileSync(subnetJsonFile, 'utf8'));
                    jsonConfig.peerings = JSON.parse(fs.readFileSync(peeringsJsonFile, 'utf8'));
                    let gwConfigs = JSON.parse(fs.readFileSync(gatewayJsonFile, 'utf8'));
                    jsonConfig.transitGWs = gwConfigs.transitGwsConfig;
                    jsonConfig.natGWs = gwConfigs.natGwsConfig;
                    jsonConfig.egressGWs = gwConfigs.egressGwsConfig;
                    jsonConfig.customerGWs = gwConfigs.custGwsConfig;
                    jsonConfig.vpGWs = gwConfigs.vpGwsConfig;
                    jsonConfig.vpnConnections = JSON.parse(fs.readFileSync(vpnConnJsonFile, 'utf8'));
                    let rtConfigs = JSON.parse(fs.readFileSync(routeTableJsonFile, 'utf8'));
                    jsonConfig.routeTables = {
                        tables: rtConfigs.tables,
                        assocs: rtConfigs.assocs,
                        tgwAttachments: rtConfigs.tgwAttachments
                    }

                } catch (err) {
                    var error = {
                        title: 'Backend filesystem error',
                        message: "Failed to read json input file for the configuration.",
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "Validate that config is shared with user (/configs)";
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    error.location = lineLocation;
                    throw error;
                }

                res.json({
                    data: jsonConfig
                })

            } else {
                const rgJsonFile = `${jsonConfigFolder}/rgConfig.json`;
                const vpcJsonFile = `${jsonConfigFolder}/vpcConfig.json`;
                const subnetJsonFile = `${jsonConfigFolder}/subnetConfig.json`;
                const publicIPJsonFile = `${jsonConfigFolder}/publicIpConfig.json`;

                let jsonConfig = {};

                try {
                    var lineLocation = getLineLocation();
                    jsonConfig.rgs = JSON.parse(fs.readFileSync(rgJsonFile, 'utf8'));
                    jsonConfig.vpcs = JSON.parse(fs.readFileSync(vpcJsonFile, 'utf8'));
                    jsonConfig.subnets = JSON.parse(fs.readFileSync(subnetJsonFile, 'utf8'));
                    jsonConfig.publicIPs = JSON.parse(fs.readFileSync(publicIPJsonFile, 'utf8'));

                } catch (err) {
                    var error = {
                        title: 'Backend filesystem error',
                        message: "Failed to read json input file for the configuration.",
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "Validate that config is shared with user (/configs)";
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    error.location = lineLocation;
                    throw error;
                }

                res.json({
                    data: jsonConfig
                })
            }
        }


    } catch (error) {
        errorLog(error)
    }
}
