const { randomUUID } = require("crypto");

const helperFunctions = require('../helperFunctions/functions');
const errorLog = require('../helperFunctions/functions').errorLog;
const getLineLocation = require('../functions').getLineLocation;

const azAdminGroupID = process.env.AZ_ADMIN_GRP_ID;

var db = require('../helperFunctions/dbConfig').dbPool;

exports.getConfigList = async (req, res) => {
    let userEmail = req.authInfo.preferred_username;
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;

    var sql = "";
    if (isAdmin) {
        sql = 'SELECT * FROM configs;';
        let configs = await new Promise((resolve) => {
            let lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (!err) {
                    for (let i = 0; i < data.length; i++) {
                        data[i].created_at = helperFunctions.formatDate(data[i].created_at)
                        if (data[i].modified_at) {
                            data[i].modified_at = helperFunctions.formatDate(data[i].modified_at)
                        }
                    }
                    resolve(data)
                } else {
                    var error = {
                        title: 'Backend server error',
                        message: 'Failed to retreive saved configurations.',
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = userEmail;
                    error.action = "List all configs (/configs)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    errorLog(error);
                }
            })
        });

        res.json({
            data: {
                configs: configs
            }
        })
    } else {
        try {
            sql = `SELECT * FROM configs WHERE (owner_email = "${userEmail}");`;
            let userConfigs = await new Promise((resolve) => {
                let lineLocation = getLineLocation();
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].created_at = helperFunctions.formatDate(data[i].created_at)
                            if (data[i].modified_at) {
                                data[i].modified_at = helperFunctions.formatDate(data[i].modified_at)
                            }
                        }
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to retreive user owned configurations.',
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = userEmail;
                        error.action = "List user owned configs (/configs)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.query);
                        errorLog(error);
                    }
                })
            });

            sql = `SELECT t1.* , t2.permissions
            FROM
            (SELECT * FROM configs
                WHERE (
                config_uuid in
                    (SELECT config_uuid FROM config_shares WHERE ( share_type = "User" AND target_id = "${userEmail}")))) t1
            LEFT JOIN
            (SELECT permissions, config_uuid FROM config_shares
                WHERE target_id = \'${userEmail}\') t2
            ON t1.config_uuid = t2.config_uuid;`;

            let sharedWithUser = await new Promise((resolve) => {
                let lineLocation = getLineLocation();
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].created_at = helperFunctions.formatDate(data[i].created_at)
                            if (data[i].modified_at) {
                                data[i].modified_at = helperFunctions.formatDate(data[i].modified_at)
                            }
                        }
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to retreive the configurations shared with the user.',
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = userEmail;
                        error.action = "List configs shared with user (/configs)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.query);
                        errorLog(error);
                    }
                })
            });

            sql = `SELECT t1.* , t2.permissions
            FROM
            (SELECT * FROM configs
                WHERE (
                config_uuid in
                    (SELECT config_uuid FROM config_shares WHERE (share_type = "Group" AND target_id IN (
                        SELECT group_name FROM user_group_assignments WHERE user_email = "${userEmail}"
                    ))
                    ))) t1
            LEFT JOIN
            (SELECT permissions, config_uuid FROM config_shares
                WHERE ( share_type = "Group" AND target_id IN (
                    SELECT group_name FROM user_group_assignments WHERE user_email = "${userEmail}"
                ))) t2
            ON t1.config_uuid = t2.config_uuid;`;

            let sharedWithGrp = await new Promise((resolve) => {
                let lineLocation = getLineLocation();
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].created_at = helperFunctions.formatDate(data[i].created_at)
                            if (data[i].modified_at) {
                                data[i].modified_at = helperFunctions.formatDate(data[i].modified_at)
                            }
                        }
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to retreive the configurations shared with the groups assigned to the user.',
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = userEmail;
                        error.action = "List configs shared with user groups (/configs)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.query);
                        errorLog(error);
                    }
                })
            });

            let newGrpShares = []
            if (sharedWithUser.length === 0) {
                newGrpShares = sharedWithGrp;
            } else {
                for (let g = 0; g < sharedWithGrp.length; g++) {
                    for (let u = 0; u < sharedWithUser.length; u++) {
                        let groupShare = sharedWithGrp[g];
                        let userShare = sharedWithUser[u]
                        if (groupShare.config_uuid !== userShare.config_uuid) {
                            newGrpShares.push(groupShare)
                        }
                    }
                }
            }
            let finalList = userConfigs;
            finalList = finalList.concat(sharedWithUser)
            finalList = finalList.concat(newGrpShares)
            res.json({
                data: {
                    configs: finalList
                }
            })
        } catch (err) {
            console.log(err)
            var error = {
                title: 'Backend server error',
                message: 'Failed to retreive saved configurations.'
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = userEmail;
            error.action = "List configs shared with user groups (/configs)";
            error.location = lineLocation;
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.query);
            errorLog(error);
        }
    }


}
exports.getConfigShares = async (req, res) => {
    let data = {};

    try {
        let configUUID = req.query.configUUID;
        let sql = `SELECT * FROM config_shares WHERE config_uuid = \'${configUUID}\';`;
        data.shares = await new Promise((resolve) => {
            let lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (!err) {
                    resolve(data)
                } else {
                    var error = {
                        title: 'Backend server error',
                        message: 'Failed to retreive active shares for this configuration.',
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "List active shares of configuration (/configs)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    errorLog(error);
                }
            })
        });

        sql = `SELECT email FROM users;`
        data.userList = await new Promise((resolve) => {
            let lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (!err) {
                    let tempData = [];
                    for (let i = 0; i < data.length; i++) {
                        tempData.push(data[i].email)
                    }
                    resolve(tempData)
                } else {
                    var error = {
                        title: 'Backend server error',
                        message: 'Failed to retreive user list.',
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "List user emails (/configs)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    errorLog(error);
                }
            })
        });

        sql = `SELECT group_name FROM user_groups;`
        data.groupList = await new Promise((resolve) => {
            let lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (!err) {
                    resolve(data)
                } else {
                    var error = {
                        title: 'Backend server error',
                        message: 'Failed to retreive group list.',
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "List groups (/configs)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    errorLog(error);
                }
            })
        });

        res.json({
            data: data
        })
    } catch (error) {

    }

}
exports.modifyConfigShares = async (req, res) => {
    try {
        let configUUID = req.body.configUUID;
        let shares = req.body.shares;

        let sql = `DELETE FROM config_shares WHERE (id IN \
            (SELECT id from config_shares WHERE config_uuid = \'${configUUID}\'));`

        await new Promise((resolve) => {
            let lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (err) {
                    console.log(err)
                    var error = {
                        title: 'Backend server error',
                        message: 'Failed to delete current config shares.',
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "Delete current config shares (/configs)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.body);
                    errorLog(error);
                } else {
                    resolve("OK")
                }
            })
        });
        sql = "";
        for (let i = 0; i < shares.length; i++) {
            let share = shares[i];
            sql = `INSERT INTO config_shares (config_uuid, share_type, target_id, permissions) VALUES (\
                \'${configUUID}\', \'${share.share_type}\', '${share.target_id}\', \'${share.permissions}\');`

            await new Promise((resolve) => {
                let lineLocation = getLineLocation();
                db.query(sql, function (err, data, fields) {
                    if (err) {
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to create the new config shares.',
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Create the set of active shares for the config (/configs)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    } else {
                        resolve("OK")
                    }
                })
            });
        }

        res.json({
            data: {}
        })
    } catch (error) {
        errorLog(error)
    }


};

