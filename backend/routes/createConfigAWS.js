const uuidv4 = require('uuid').v4;
const path = require('path');
const { randomUUID } = require("crypto");
const exec = require('child_process').exec;
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


exports.createConfigAWS = async (req, res) => {
    /**
     * Creates all the files for the Terraform configuration for AWS
     */

    let userEmail = req.authInfo.preferred_username;
    let saveMethod = req.body.saveMethod;
    let configExists = req.body.config.configExists;
    let configName = req.body.config.configName;
    let configUUID = req.body.config.configUUID;
    let awsConfig = req.body.aws;
    let vpcsConfig = req.body.vpcs;
    let subnetsConfig = req.body.subnets;
    let peeringsConfig = req.body.peerings;
    let gatewaysConfig = {
        transitGwsConfig: req.body.transitGWs,
        egressGwsConfig: req.body.egressGWs,
        natGwsConfig: req.body.natGateways,
        custGwsConfig: req.body.customerGWs,
        vpGwsConfig: req.body.vpGWs
    };
    let vpnConnections = req.body.vpnConnections;
    let routeTablesConfig = {
        tables: req.body.routeTables.tables,
        assocs: req.body.routeTables.assocs,
        tgwAttachments: req.body.routeTables.tgwAttachments
    };

    try {

        let sql = `SELECT fa_access_key, fa_secret FROM aws_accounts \
        WHERE (account_name = \'${awsConfig.awsAccount}\');`;

        let awsInfo = await new Promise((resolve) => {
            let lineLocation = getLineLocation();
            db.query(sql, function (err, data, fields) {
                if (!err) {
                    let awsData = {
                        awsAccessKey: data[0].fa_access_key,
                        awsSecret: data[0].fa_secret
                    }
                    resolve(awsData)
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
                    error.action = "Get the access key of the requested account (/aws)";
                    error.location = lineLocation;
                    error.originalUrl = req._parsedUrl.pathname;
                    error.requestParams = JSON.stringify(req.body);
                    errorLog(error);
                }
            })
        })

        awsInfo.region = awsConfig.awsRegion;

        for (let i = 0; i < peeringsConfig.length; i++) {
            let peerAccountName = peeringsConfig[i].peerAccountName;

            if (peerAccountName !== "-- Other --") {
                if (peerAccountName != "Same Account") {
                    sql = `SELECT aws_id FROM aws_accounts \
                    WHERE (account_name = \'${peerAccountName}\');`;

                    let peerAccountId = await new Promise((resolve) => {
                        let lineLocation = getLineLocation();
                        db.query(sql, function (err, data, fields) {
                            if (!err) {
                                resolve(data[0].aws_id)
                            } else {
                                res.statusCode = 501
                                var error = {
                                    title: 'Backend server error',
                                    message: 'Could not retreive peer account IDs.',
                                    errorID: randomUUID()
                                }
                                console.log(error)
                                res.json({
                                    error: error
                                })
                                error.details = err;
                                error.userEmail = req.authInfo.preferred_username;
                                error.action = "Peer account ID read (/aws)";
                                error.location = lineLocation;
                                error.originalUrl = req._parsedUrl.pathname;
                                error.requestParams = JSON.stringify(req.body);
                                errorLog(error);
                            }
                        })
                    });
                    peeringsConfig[i].peerAccountId = peerAccountId;
                }
            }
        }

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
                            error.action = "Read config's current status (/aws)";
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
            (\'${userEmail}\', \'${configName}\', \'${configUUID}\', \'${awsConfig.awsAccount}\', \'${awsConfig.awsRegion}\', \'${userEmail}\', NOW(), 'false', 'AWS', \'${status}\');`

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
                        error.action = "Create new config entry (/aws)";
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
            error.action = "Create new config directory (/aws)";
            error.location = lineLocation;
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.body);
            throw error
        }

        const awsJsonFile = `${jsonConfigFolder}/awsConfig.json`;
        const vpcJsonFile = `${jsonConfigFolder}/vpcConfig.json`;
        const subnetJsonFile = `${jsonConfigFolder}/subnetConfig.json`;
        const peeringsJsonFile = `${jsonConfigFolder}/peeringsConfig.json`;
        const gatewaysJsonFile = `${jsonConfigFolder}/gatewaysConfig.json`;
        const vpnConnJsonFile = `${jsonConfigFolder}/vpnConnectionsConfig.json`;
        const routeTableJsonFile = `${jsonConfigFolder}/routeTablesConfig.json`;

        try {
            var lineLocation = getLineLocation();
            fs.writeFileSync(awsJsonFile, JSON.stringify(awsInfo), (err) => { return err })
            fs.writeFileSync(vpcJsonFile, JSON.stringify(vpcsConfig), (err) => { return err })
            fs.writeFileSync(subnetJsonFile, JSON.stringify(subnetsConfig), (err) => { return err })
            fs.writeFileSync(peeringsJsonFile, JSON.stringify(peeringsConfig), (err) => { return err })
            fs.writeFileSync(gatewaysJsonFile, JSON.stringify(gatewaysConfig), (err) => { return err })
            fs.writeFileSync(vpnConnJsonFile, JSON.stringify(vpnConnections), (err) => { return err })
            fs.writeFileSync(routeTableJsonFile, JSON.stringify(routeTablesConfig), (err) => { return err })
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
            error.action = "Create json config files (/aws)";
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
                const runPyCommand = `cd ${pythonScriptRootFolder} && ${pyExec} main.py aws "${configUUID}" "${configName}"`
                await Promise.resolve()
                    .then(makeExec(runPyCommand))
            } else if (pythonEnv === 'docker') {
                let containerName = `ec2c-tf-job-${configUUID}`
                const pyRunContainerCommand = 
                    `docker run --rm --name "${containerName}" -e ENV='docker' -v ${absDataPath}:/data ec2c-python-job aws "${configUUID}" "${configName}"`
                await Promise.resolve()
                    .then(makeExec(pyRunContainerCommand))
            } else if (pythonEnv === "kubernetes") {
                var lineLocation = getLineLocation();
                let kubeHelper = {};
                kubeHelper.i = new KubernetesHelper()
                let jobStatus = '';
                try {
                    jobStatus = await kubeHelper.i.createPyJob('aws', configUUID, configName, 'dummy', 'default');
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
            error.action = "Create terraform config files (/aws)";
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
