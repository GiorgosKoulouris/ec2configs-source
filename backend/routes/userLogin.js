const uuidv4 = require('uuid').v4;
const { randomUUID } = require("crypto");
const loginLog = require('../helperFunctions/functions').loginLog;

const azAdminGroupID = process.env.AZ_ADMIN_GRP_ID;

var db = require('../helperFunctions/dbConfig').dbPool;

exports.userLogin = async (req, res) => {
    let userEmail = req.authInfo.preferred_username;
    let userName = req.authInfo.name;
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? "true" : "false";
    try {
        let sql = `SELECT id from users WHERE (email = \'${userEmail}\');`
        let users = await new Promise((resolve) => {
            db.query(sql, function (err, data, fields) {
                if (err) {
                    var error = {
                        title: 'Backend server error',
                        message: 'Failed to retreive application users. Please contact your administrator.'
                    }
                    res.statusCode = 501;
                    res.json({
                        error: error
                    })
                    let log = {
                        id: randomUUID(),
                        userEmail: userEmail,
                        userName: userName,
                        isAdmin: isAdmin,
                        ip: req.ip,
                        error: "Failed to retreive application users"
                    }
                    loginLog(log);
                } else {
                    resolve(data)
                }
            })
        });
        if (users.length === 1) {
            let id = users[0].id;
            sql = `UPDATE users SET last_login = NOW(), is_admin = \'${isAdmin}\' WHERE ( id = ${id});`;
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (err) {
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to update user logon data. Please contact your administrator.'
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        let log = {
                            id: randomUUID(),
                            userEmail: userEmail,
                            userName: userName,
                            isAdmin: isAdmin,
                            ip: req.ip,
                            error: "Failed to update user logon data"
                        }
                        loginLog(log);
                    } else { resolve() }
                })
            })
        } else if (users.length === 0) {
            let userUUID = uuidv4();
            sql = `INSERT INTO users (email, username, user_uuid, first_login, last_login, is_admin) VALUES \
                (\'${userEmail}\', \'${userName}\', \'${userUUID}\', NOW(), NOW(), \'${isAdmin}\');`
            await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (err) {
                        console.log(err)
                        var error = {
                            title: 'Backend server error',
                            message: 'Failed to create new user entry. Please contact your administrator.'
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        let log = {
                            id: randomUUID(),
                            userEmail: userEmail,
                            userName: userName,
                            isAdmin: isAdmin,
                            ip: req.ip,
                            error: "Failed to create new user entry"
                        }
                        loginLog(log);
                    } else resolve()
                })
            })
        } else {
            var error = {
                title: 'Backend server error',
                message: `Multiple users found with user email ${userEmail}. Please contact your administrator.`
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            let log = {
                id: randomUUID(),
                userEmail: userEmail,
                userName: userName,
                isAdmin: isAdmin,
                ip: req.ip,
                error: "Multiple users found with this email"
            }
            loginLog(log);
            throw error;
        }

        res.json({
            data: users
        })
        let log = {
            id: randomUUID(),
            userEmail: userEmail,
            userName: userName,
            isAdmin: isAdmin,
            ip: req.ip,
            error: "None"
        }
        loginLog(log)

    } catch (error) {
        console.log(error);
    }

};
