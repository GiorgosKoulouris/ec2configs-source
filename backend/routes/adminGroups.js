require('dotenv').config();

const helperFunctions = require('../helperFunctions/functions');
const azAdminGroupID = process.env.AZ_ADMIN_GRP_ID;

const { randomUUID } = require("crypto");
const errorLog = require('../helperFunctions/functions').errorLog;
const authLog = require('../helperFunctions/functions').authLog;
const getLineLocation = require('../functions').getLineLocation;

var db = require('../helperFunctions/dbConfig').dbPool;

exports.getGroups = async (req, res) => {
    let lineLocation = getLineLocation();
    try {
        let userGroups = req.authInfo.roles;
        let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;

        const sql = "SELECT group_name, owner_email, created_at, created_by FROM user_groups \
                    ORDER BY group_name;";

        db.query(sql, function (err, data, fields) {
            if (err) {
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
                error.location = lineLocation;
                error.originalUrl = req._parsedUrl.pathname;
                error.requestParams = JSON.stringify(req.query);
                errorLog(error);
            } else {
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
                    error.action = "Read user group list (/admin)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.query);
                    authLog(error);
                } else {
                    if (!err) {
                        for (let i = 0; i < data.length; i++) {
                            // let ms = Date.parse(data[i].created_at)
                            data[i].created_at = helperFunctions.formatDate(data[i].created_at)
                        }
                        res.json({
                            data
                        })
                    }
                }
            }
        })
    } catch (error) {

    }

}
exports.deleteGroup = async (req, res) => {
    let groupToDelete = req.body.groupToDelete;

    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;

    if (!isAdmin) {
        let lineLocation = getLineLocation();
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
        error.action = "Delete user group (/admin)";
        error.location = lineLocation;
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.body);
        authLog(error);
    } else {
        try {
            let sql = `DELETE FROM aws_access_list WHERE ( target_type = 'group' AND target_id = \'${groupToDelete}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete the access list associated with group ${groupToDelete}.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user group (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.query);
                        errorLog(error);
                    }
                })
            });

            let lineLocation = getLineLocation();
            sql = `DELETE FROM config_shares WHERE ( share_type = 'group' AND target_id = \'${groupToDelete}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete the configs share associations related to group ${groupToDelete}.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user group (/admin)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.query);
                        errorLog(error);
                    }
                })
            });
            sql = `DELETE FROM user_group_assignments WHERE (group_name = \'${groupToDelete}\');`;
            lineLocation = getLineLocation();
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete the configs share associations related to group ${groupToDelete}.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user group (/admin)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.query);
                        errorLog(error);
                    }
                })
            });

            sql = `DELETE FROM user_groups WHERE ( group_name = \'${groupToDelete}\');`;
            lineLocation = getLineLocation();
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not delete the configs share associations related to group ${groupToDelete}.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Delete user group (/admin)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.query);
                        errorLog(error);
                    }
                })
            });

            res.json({})

        } catch (error) {
            console.log(error)
        }
    }


}
exports.addGroup = async (req, res) => {
    let ownerEmail = req.body.ownerEmail;
    let createdByEmail = req.authInfo.preferred_username;
    let groupToCreate = req.body.groupToCreate;

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
        error.action = "Add user group (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.body);
        authLog(error);
    } else {
        try {
            let sql = `SELECT group_name FROM user_groups WHERE (group_name = \'${groupToCreate}\');`;
            let withSameName = await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not get the current group list.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Add user group (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            try {
                if (withSameName.length > 0) {
                    var error = {
                        title: 'Input error',
                        message: `A group with this name already exists.`,
                        errorID: randomUUID()
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    error.details = "A group with this name already exists";
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "Add user group (/admin)";
                    error.location = getLineLocation();
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.body);
                    throw error;
                }

            } catch (error) {
                errorLog(error)
                throw error
            }

            sql = `INSERT INTO user_groups (group_name, owner_email, created_at, created_by) VALUES \
            (\'${groupToCreate}\', \'${ownerEmail}\', NOW(), \'${createdByEmail}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not create the group entry.`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Add user group (/admin)";
                        error.location = getLineLocation();
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });

            res.json({})

        } catch (error) {
            console.log(error)
        }
    }
}
exports.getGroupMembers = async (req, res) => {
    let groupToEdit = req.query.groupToEdit;

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
        error.action = "Get group members (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.query);
        authLog(error);
    } else {
        try {
            let sql = `SELECT user_email, added_by, added_at FROM user_group_assignments WHERE (group_name = \'${groupToEdit}\');`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        for (let i = 0; i < data.length; i++) {
                            data[i].added_at = helperFunctions.formatDate(data[i].added_at);

                        }
                        res.json({
                            data: data
                        })
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Backend server error',
                            message: `Could not read group members.`,
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
            });

        } catch (error) {
            console.log(error)
        }
    }

}
exports.modifyGroupMembers = async (req, res) => {
    let groupToEdit = req.body.groupToEdit;
    let members = req.body.members;
    let addedByEmail = req.authInfo.preferred_username;

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
        error.action = "Modify group members (/admin)";
        error.location = getLineLocation();
        error.originalUrl = req._parsedUrl.pathname;
        error.requestParams = JSON.stringify(req.body);
        authLog(error);
    } else {
        try {
            if (members.length === 0) {
                let sql = `DELETE FROM user_group_assignments WHERE (group_name = \'${groupToEdit}\');`
                await new Promise((resolve) => {
                    db.query(sql, function (err, data, fields) {
                        if (!err) {
                            resolve(data)
                            res.json({})
                        } else {
                            var error = {
                                title: 'Backend server error',
                                message: `Could not modify the member list of group ${groupToEdit}.`,
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = req.authInfo.preferred_username;
                            error.action = "Modify group members (/admin)";
                            error.location = getLineLocation();
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.body);
                            errorLog(error);
                        }
                    })
                });

            } else {
                let memberList = `(`;
                for (let i = 0; i < members.length; i++) {
                    let member = members[i].user_email;
                    if (i < members.length - 1) {
                        memberList += `\'${member}\', `;
                    } else {
                        memberList += `\'${member}\')`;
                    }
                }
                let sql = `DELETE FROM user_group_assignments WHERE (group_name = \'${groupToEdit}\' AND id NOT IN (\
                    SELECT id FROM user_group_assignments WHERE (group_name = \'${groupToEdit}\' AND user_email IN ${memberList})));`

                await new Promise((resolve) => {
                    db.query(sql, function (err, data, fields) {
                        if (!err) {
                            resolve(data)
                        } else {
                            var error = {
                                title: 'Backend server error',
                                message: `Could not modify the member list of group ${groupToEdit}.`,
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = req.authInfo.preferred_username;
                            error.action = "Modify group members (/admin)";
                            error.location = getLineLocation();
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.body);
                            errorLog(error);
                        }
                    })
                });

                for (let i = 0; i < members.length; i++) {
                    let userEmail = members[i].user_email;

                    sql = `SELECT id FROM user_group_assignments WHERE (group_name = \'${groupToEdit}\' AND user_email = \'${userEmail}\');`
                    let count = await new Promise((resolve) => {
                        db.query(sql, function (err, data, fields) {
                            if (!err) {
                                resolve(data.length)
                            } else {
                                var error = {
                                    title: 'Backend server error',
                                    message: `Failed to check current assignments for user ${userEmail}.`,
                                    errorID: randomUUID()
                                }
                                res.statusCode = 501;
                                res.json({
                                    error: error
                                })
                                error.details = err;
                                error.userEmail = req.authInfo.preferred_username;
                                error.action = "Modify group members (/admin)";
                                error.location = getLineLocation();
                                error.originalUrl = req._parsedUrl.pathname;
                                error.requestParams = JSON.stringify(req.body);
                                errorLog(error);
                            }
                        })
                    });

                    if (count === 0) {
                        sql = `INSERT INTO user_group_assignments (user_email, group_name, added_by, added_at) \
                        VALUES (\'${userEmail}\', \'${groupToEdit}\', \'${addedByEmail}\', NOW());`;

                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    var error = {
                                        title: 'Backend server error',
                                        message: `Failed to add the requested members to group ${groupToEdit}.`,
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Modify group members (/admin)";
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

        } catch (error) {
            console.log(error)
        }
    }

}