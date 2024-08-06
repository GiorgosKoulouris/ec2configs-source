require('dotenv').config();

const helperFunctions = require('../helperFunctions/functions');
const azAdminGroupID = process.env.AZ_ADMIN_GRP_ID;

const { randomUUID } = require("crypto");
const errorLog = require('../helperFunctions/functions').errorLog;
const authLog = require('../helperFunctions/functions').authLog;
const getLineLocation = require('../functions').getLineLocation;

var db = require('../helperFunctions/dbConfig').dbPool;

exports.getUsers = async (req, res) => {
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;
    const sql = "SELECT * FROM users ORDER BY username;";

    if (!isAdmin) {
        var error = {
            title: 'Not authorized',
            message: 'This action is restricted to the app admins.',
            errorID: randomUUID()
        }
        res.statusCode = 501;
        res.json({
            error: error
        })
        error.details = "Not authorized - Restricted to the app admins";
        error.userEmail = req.authInfo.preferred_username;
        error.action = "Get users (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.query);
        authLog(error);
    } else {
        db.query(sql, function (err, data, fields) {
            if (!err) {
                for (let i = 0; i < data.length; i++) {
                    data[i].first_login = helperFunctions.formatDate(data[i].first_login)
                    data[i].last_login = helperFunctions.formatDate(data[i].last_login)
                }
                res.json({
                    data
                })
            } else {
                var error = {
                    title: 'Backend server error',
                    message: 'Could not retreive user list.',
                    errorID: randomUUID()
                }
                res.statusCode = 501;
                res.json({
                    error: error
                })
                error.details = err;
                error.userEmail = req.authInfo.preferred_username;
                error.action = "Get group members (/admin)";
                error.location = getLineLocation();
                error.originalUrl = req._parsedUrl.pathname;
                error.requestParams = JSON.stringify(req.query);
                errorLog(error);
            }
        })
    }
}
exports.getGroups = async (req, res) => {
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;
    const sql = "SELECT group_name, owner_email, created_at, created_by FROM user_groups \
                ORDER BY group_name;";

    if (!isAdmin) {
        var error = {
            title: 'Not authorized',
            message: 'This action is restricted to the app admins.',
            errorID: randomUUID()
        }
        res.statusCode = 501;
        res.json({
            error: error
        })
        error.details = "Not authorized - Restricted to the app admins";
        error.userEmail = req.authInfo.preferred_username;
        error.action = "Get groups (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.query);
        authLog(error);
    } else {
        db.query(sql, function (err, data, fields) {
            if (!err) {
                for (let i = 0; i < data.length; i++) {
                    data[i].created_at = helperFunctions.formatDate(data[i].created_at)
                }
                res.json({
                    data
                })
            } else {
                var error = {
                    title: 'Backend server error',
                    message: 'Could not retreive group list.',
                    errorID: randomUUID()
                }
                res.statusCode = 501;
                res.json({
                    error: error
                })
                error.details = err;
                error.userEmail = req.authInfo.preferred_username;
                error.action = "Read user group list (/admin)";
                error.location = getLineLocation();
                error.originalUrl = req._parsedUrl.pathname;
                error.requestParams = JSON.stringify(req.query);
                errorLog(error);
            }
        })
    }
}
exports.getUserMemberships = async (req, res) => {
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;
    let userEmail = req.query.userEmail;
    const sql = `SELECT group_name, added_by, added_at FROM user_group_assignments \
                WHERE (user_email = \'${userEmail}\')\
                ORDER BY group_name;`;

    if (!isAdmin) {
        var error = {
            title: 'Not authorized',
            message: 'This action is restricted to the app admins.',
            errorID: randomUUID()
        }
        res.statusCode = 501;
        res.json({
            error: error
        })
        error.details = "Not authorized - Restricted to the app admins";
        error.userEmail = req.authInfo.preferred_username;
        error.action = "Get user memberships (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.query);
        authLog(error);
    } else {
        db.query(sql, function (err, data, fields) {
            if (!err) {
                for (let i = 0; i < data.length; i++) {
                    data[i].added_at = helperFunctions.formatDate(data[i].added_at)
                }
                res.json({
                    data
                })
            } else {
                var error = {
                    title: 'Backend server error',
                    message: `Could not retreive group assignments for user ${userEmail}.`,
                    errorID: randomUUID()
                }
                res.statusCode = 501;
                res.json({
                    error: error
                })
                error.details = err;
                error.userEmail = req.authInfo.preferred_username;
                error.action = "Read user memberships (/admin)";
                error.location = getLineLocation();
                error.originalUrl = req._parsedUrl.pathname;
                error.requestParams = JSON.stringify(req.query);
                errorLog(error);
            }
        })
    }
}
exports.modifyUserMemberships = async (req, res) => {
    let addedByEmail = req.authInfo.preferred_username;
    let userToEdit = req.body.userToEdit;
    let memberships = req.body.memberships;
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;
    if (!isAdmin) {
        var error = {
            title: 'Not authorized',
            message: 'This action is restricted to the app admins.',
            errorID: randomUUID()
        }
        res.statusCode = 501;
        res.json({
            error: error
        })
        error.details = "Not authorized - Restricted to the app admins";
        error.userEmail = req.authInfo.preferred_username;
        error.action = "Modify user memberships (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.body);
        authLog(error);
    } else {
        if (memberships.length === 0) {
            let sql = `DELETE FROM user_group_assignments WHERE (user_email = \'${userToEdit}\');`
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to delete the requested assignments.',
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Modify user group memberships (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });
        } else {
            let groupList = `(`;
            for (let i = 0; i < memberships.length; i++) {
                let grp = memberships[i].group_name;
                if (i < memberships.length - 1) {
                    groupList += `\'${grp}\', `;
                } else {
                    groupList += `\'${grp}\')`;
                }
            }

            let sql = `DELETE FROM user_group_assignments WHERE (user_email = \'${userToEdit}\' AND id NOT IN (\
                SELECT id FROM user_group_assignments WHERE (user_email = \'${userToEdit}\' AND group_name IN ${groupList})));`
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to delete the requested assignments.',
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Modify user memberships (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            for (let i = 0; i < memberships.length; i++) {
                let groupName = memberships[i].group_name;

                sql = `SELECT id FROM user_group_assignments WHERE (user_email = \'${userToEdit}\' AND group_name = \'${groupName}\');`
                let count = await new Promise((resolve) => {
                    db.query(sql, function (err, data, fields) {
                        if (!err) {
                            resolve(data.length)
                        } else {
                            var error = {
                                title: 'Backend server error',
                                message: `Failed to check current assignments for user ${userToEdit}.`,
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = req.authInfo.preferred_username;
                            error.action = "Modify user memberships (/admin)";
                            error.location = getLineLocation();
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.body);
                            errorLog(error);
                        }
                    })
                });

                if (count === 0) {
                    sql = `INSERT INTO user_group_assignments (user_email, group_name, added_by, added_at) \
                    VALUES (\'${userToEdit}\', \'${groupName}\', \'${addedByEmail}\', NOW());`;

                    await new Promise((resolve) => {
                        db.query(sql, function (err, data, fields) {
                            if (!err) {
                                resolve(data)
                            } else {
                                var error = {
                                    title: 'Backend server error',
                                    message: `Failed to add the requested assignments to user ${userToEdit}.`,
                                    errorID: randomUUID()
                                }
                                res.statusCode = 501;
                                res.json({
                                    error: error
                                })
                                error.details = err;
                                error.userEmail = req.authInfo.preferred_username;
                                error.action = "Modify user memberships (/admin)";
                                error.location = getLineLocation();
                                error.originalUrl = req._parsedUrl.pathname;
                                error.requestParams = JSON.stringify(req.body);
                                errorLog(error);
                            }
                        })
                    });
                }
            }
        }
        res.json({})
    }
}
exports.deleteUser = async (req, res) => {
    let userToModify = req.body.userToModify;
    let userToTransfer = req.body.userToTransfer;
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;

    if (!isAdmin) {
        var error = {
            title: 'Not authorized',
            message: 'This action is restricted to the app admins.',
            errorID: randomUUID()
        }
        res.statusCode = 501;
        res.json({
            error: error
        })
        error.details = "Not authorized - Restricted to the app admins";
        error.userEmail = req.authInfo.preferred_username;
        error.action = "Delete user (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.body);
        authLog(error);
    } else {
        try {
            let sql = `DELETE FROM aws_access_list WHERE ( target_type = 'user' AND target_id = \'${userToModify}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete the access list associated with user ${userToModify}.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            sql = `UPDATE configs SET owner_email = \'${userToTransfer}\' WHERE (owner_email = \'${userToModify}\');`
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not transfer the config ownerships associated with user \'${userToModify}\'.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            sql = `DELETE FROM config_shares WHERE ( share_type = 'User' AND target_id = \'${userToModify}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete the config shares associated with user \'${userToModify}\'.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            sql = `DELETE FROM user_group_assignments WHERE ( user_email = \'${userToModify}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete the group assignments associated with user \'${userToModify}\'.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            sql = `UPDATE user_groups SET owner_email = \'${userToTransfer}\' WHERE ( owner_email = \'${userToModify}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not transfer the group ownerships associated with user \'${userToModify}\'.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            sql = `DELETE FROM config_shares WHERE (\
                target_id = \'${userToTransfer}\' AND config_uuid IN (\
                SELECT config_uuid FROM configs WHERE (owner_email = \'${userToTransfer}\')));`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not modify the shared configs tha are already owned by user \'${userToModify}\'.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            sql = `DELETE FROM users WHERE ( email = \'${userToModify}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete user entry for \'${userToModify}\'.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            res.json({
                data: "Sucess"
            })

        } catch (error) {
            console.log(error)
        }
    }

}