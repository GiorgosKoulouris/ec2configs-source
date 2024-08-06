const uuidv4 = require('uuid').v4;
const { randomUUID } = require("crypto");
const exec = require('child_process').exec;
const path = require('path');
const getLineLocation = require('../functions').getLineLocation;
const errorLog = require('../helperFunctions/functions').errorLog;
const fs = require('fs');
const getPythonEnvironment = require('../helperFunctions/env').getPythonEnvironment;
const getPythonScriptFolder = require('../helperFunctions/env').getPythonScriptFolder;
const getPythonExec = require('../helperFunctions/env').getPythonExec;
const { KubernetesHelper } = require('../helperFunctions/kubernetes');

var getAbsDataPath = require('../helperFunctions/env').getAbsDataPath;
const absDataPath = getAbsDataPath();

var db = require('../helperFunctions/dbConfig').dbPool;

function makeExec(command) {
    return function (/* ignore results */) {
        return new Promise(function (resolve, reject) {
            exec(command, function (err, stdout, stderr) {
                if (err != null) reject(Object.assign(err, { stderr }));
                else resolve(stdout);
            });
        });
    };
}


exports.createConfigAzure = async (req, res) => {
    /**
     * Creates all the files for the Terraform configuration for AWS
     */

    let userEmail = req.authInfo.preferred_username;
    let saveMethod = req.body.saveMethod;
    let configExists = req.body.config.configExists;
    let configName = req.body.config.configName;
    let configUUID = req.body.config.configUUID;
    let azConfig = req.body.az;
    let rgConfig = req.body.rgs;
    let vpcConfig = req.body.vpcs;
    let subnetConfig = req.body.subnets;
    let pipConfig = req.body.publicIPs;

    try {

        let sql = `SELECT tenant_id, subscription_id, application_id, secret_value FROM az_subscriptions WHERE (subscription_name = \'${azConfig.azSubscription}\');`;

        let azInfo = await new Promise((resolve) => {
            let lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (!err) {
                    let azData = {
                        tenant_id: data[0].tenant_id,
                        subscription_id: data[0].subscription_id,
                        application_id: data[0].application_id,
                        secret_value: data[0].secret_value
                    }
                    resolve(azData)
                } else {
                    res.statusCode = 501
                    var error = {
                        title: 'Backend server error',
                        message: 'Could not retreive the appropriate credentials.',
                        errorID: randomUUID()
                    }
                    res.json({
                        error: error
                    })
                    error.details = err;
                    error.userEmail = req.authInfo.preferred_username;
                    error.action = "Get the secret of the requested account (/az)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.body);
                    errorLog(error);
                }
            })
        })

        azInfo.region = azConfig.azRegion;


        let configFolder = "";
        if (configExists) {
            configFolder = `${absDataPath}/${configUUID}`;

            let status = "";
            if (saveMethod === "apply") {
                status = "Applied";
            } else {
                sql = `SELECT status FROM configs \
                WHERE (config_uuid = \'${configUUID}\');`;

                let dumpData = await new Promise((resolve) => {
                    let lineLocation = getLineLocation();
                    db.query(sql, function (err, data, fields) {
                        if (!err) {
                            resolve(data[0].status);
                        } else {
                            var error = {
                                title: 'Database error',
                                message: "Could not retreive current status for the selected config.",
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = req.authInfo.preferred_username;
                            error.action = "Read config's current status (/az)";
                            error.location = lineLocation;
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.body);
                            errorLog(error);
                        }
                    })
                });
                if (dumpData === "Generated" || dumpData.includes(' / Modified')) {
                    status = dumpData;
                } else {
                    status = `${dumpData} / Modified`
                }
            }

            sql = `UPDATE configs SET modified_at = NOW(), modified_by = \'${userEmail}\', config_name = \'${configName}\', status = \'${status}\' \
            WHERE (config_uuid = \'${configUUID}\');`
            await new Promise((resolve) => {
                let lineLocation = getLineLocation();
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Database error',
                            message: "Could not update the selected config's status.",
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Update config's current status to pending (/aws)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });
        } else {
            configUUID = uuidv4();
            configFolder = `${absDataPath}/${configUUID}`;

            let status = "Generated";

            sql = `INSERT INTO configs \
            (owner_email, config_name, config_uuid, account, region, created_by, created_at, deleted, cloud_provider, status) VALUES \
            (\'${userEmail}\', \'${configName}\', \'${configUUID}\', \'${azConfig.azSubscription}\', \'${azConfig.azRegion}\', \'${userEmail}\', NOW(), 'false', 'Azure', \'${status}\');`

            await new Promise((resolve) => {
                let lineLocation = getLineLocation();
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        var error = {
                            title: 'Database error',
                            message: "Could not create database entry for the config.",
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Create new config entry (/az)";
                        error.location = lineLocation;
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        errorLog(error);
                    }
                })
            });
        }

        const configFolderExists = fs.existsSync(configFolder);
        const jsonConfigFolder = `${configFolder}/json`;
        const tfConfigFolder = `${configFolder}/terraform`;

        try {
            var lineLocation = getLineLocation();
            if (!configFolderExists) {
                fs.mkdirSync(configFolder);
                fs.mkdirSync(jsonConfigFolder);
                fs.mkdirSync(tfConfigFolder);
            }
        } catch (err) {
            var error = {
                title: 'Backend filesystem error',
                message: "Could not create the directory for the configuration.",
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = req.authInfo.preferred_username;
            error.action = "Create new config directory (/az)";
            error.location = lineLocation;
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.body);
            throw error
        }

        const azJsonFile = `${jsonConfigFolder}/azConfig.json`;
        const rgJsonFile = `${jsonConfigFolder}/rgConfig.json`;
        const vpcJsonFile = `${jsonConfigFolder}/vpcConfig.json`;
        const subnetJsonFile = `${jsonConfigFolder}/subnetConfig.json`;
        const publicIpJsonFile = `${jsonConfigFolder}/publicIpConfig.json`;

        try {
            var lineLocation = getLineLocation();
            fs.writeFileSync(azJsonFile, JSON.stringify(azInfo), (err) => { return err })
            fs.writeFileSync(vpcJsonFile, JSON.stringify(vpcConfig), (err) => { return err })
            fs.writeFileSync(rgJsonFile, JSON.stringify(rgConfig), (err) => { return err })
            fs.writeFileSync(subnetJsonFile, JSON.stringify(subnetConfig), (err) => { return err })
            fs.writeFileSync(publicIpJsonFile, JSON.stringify(pipConfig), (err) => { return err })
        } catch (err) {
            var error = {
                title: 'Backend filesystem error',
                message: "Could not create json input file for the configuration.",
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = req.authInfo.preferred_username;
            error.action = "Create json config files (/az)";
            error.location = lineLocation;
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.body);
            throw error
        }

        try {
            const pythonEnv = getPythonEnvironment();
            if (pythonEnv === 'local') {
                const pythonScriptRootFolder = getPythonScriptFolder();
                const pyExec = getPythonExec();
                const runPyCommand = `cd ${pythonScriptRootFolder} && ${pyExec} main.py az "${configUUID}" "${configName}" "${azInfo.region}"`
                await Promise.resolve()
                    .then(makeExec(runPyCommand))
            } else if (pythonEnv === 'docker') {
                let containerName = `ec2c-tf-job-${configUUID}`
                const pyRunContainerCommand = 
                    `docker run --rm --name "${containerName}" -e ENV='docker' -v ${absDataPath}:/data ec2c-python-job az "${configUUID}" "${configName}" "${azInfo.region}"`
                await Promise.resolve()
                    .then(makeExec(pyRunContainerCommand))
            } else if (pythonEnv === "kubernetes") {
                var lineLocation = getLineLocation();
                let kubeHelper = {};
                kubeHelper.i = new KubernetesHelper()
                let jobStatus = '';
                try {
                    jobStatus = await kubeHelper.i.createPyJob('az', configUUID, configName, `${azInfo.region}`, 'default');
                    kubeHelper.i = null;
                    delete kubeHelper.i
                } catch (error) {
                    const errorFile = path.join(configFolder, 'lastError.log')
                    const lastError = fs.readFileSync(errorFile, 'utf8');
                    throw lastError
                }
            }
        } catch (err) {
            var error = {
                title: 'Backend server error',
                message: "Failed to create terraform config files.",
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = err;
            error.userEmail = req.authInfo.preferred_username;
            error.action = "Create terraform config files (/az)";
            error.location = lineLocation;
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.body);
            throw error
        }

        res.json({
            data: {
                fileURL: ""
            }
        })

    } catch (error) {
        errorLog(error)
    }
}
