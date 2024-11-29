var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path')

var getAbsDataPath = require('../helperFunctions/env').getAbsDataPath;
var getAbsProvidersPath = require('../helperFunctions/env').getAbsProvidersPath;
var getEnvs = require('../helperFunctions/env');

const absRootFilePath = getAbsDataPath();
const terraformEnv = getEnvs.getTerraformEnvironment();
const azAdminGroupID = process.env.AZ_ADMIN_GRP_ID;

const { randomUUID } = require("crypto");
const { KubernetesHelper } = require('../helperFunctions/kubernetes');
const errorLog = require('../helperFunctions/functions').errorLog;
const authLog = require('../helperFunctions/functions').authLog;
const getLineLocation = require('../functions').getLineLocation;

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


exports.modifyConfig = async (req, res) => {
    let userGroups = req.authInfo.roles;
    let isAdmin = userGroups.includes(azAdminGroupID) ? true : false;

    let userEmail = req.authInfo.preferred_username;
    let saveMethod;
    let planApply;
    if (req.body.saveMethod === "Apply" || req.body.saveMethod === "Plan") {
        saveMethod = "Plan/Apply";
        planApply = req.body.saveMethod;
    } else {
        saveMethod = req.body.saveMethod;
    }
    let configUUID = req.body.configUUID;
    let provider = "";
    if (req.body.provider === "AWS") {
        provider = "aws"
    } else {
        provider = "az"
    }

    const configFolder = `${absRootFilePath}/${configUUID}`;
    const tfConfigFolder = `${configFolder}/terraform`;
    const planLogFile = `${configFolder}/planLog.txt`;

    try {
        var sql = "";
        let canExecute = isAdmin ? true : false;
        if (!canExecute) {
            sql = `SELECT owner_email from configs WHERE ( config_uuid = "${configUUID}" )`
            let ownerEmail = await new Promise((resolve) => {
                db.query(sql, function (err, data, fields) {
                    if (!err) {
                        resolve(data)
                    } else {
                        console.log(err);
                        var error = {
                            title: 'Backend server error',
                            message: "Failed to get config's ownership.",
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = err;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Config actions (/configs)";
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        error.location = getLineLocation();
                        errorLog(error)
                    }
                })
            });

            if (!canExecute) {
                canExecute = userEmail === ownerEmail ? true : false;
            }
            if (!canExecute) {
                sql = `SELECT permissions FROM config_shares WHERE ( \
                    config_uuid = "${configUUID}" AND ( (share_type = "User" AND target_id = "${userEmail}")));`

                let permissionList = await new Promise((resolve) => {
                    db.query(sql, function (err, data, fields) {
                        if (!err) {
                            let temp = [];
                            for (let i = 0; i < data.length; i++) {
                                temp = temp.concat(data[i].permissions);
                            }
                            resolve(temp)
                        } else {
                            var error = {
                                title: 'Backend server error',
                                message: "Failed to get config's user shares.",
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = req.authInfo.preferred_username;
                            error.action = "Config actions (/configs)";
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.body);
                            error.location = getLineLocation();
                            errorLog(error)
                        }
                    })
                })

                if (permissionList.length === 0) {
                    sql = `SELECT permissions FROM config_shares WHERE ( \
                        share_type = "Group" AND target_id IN (SELECT group_name FROM user_group_assignments WHERE user_email = "${userEmail}"));`

                    permissionList = await new Promise((resolve) => {
                        db.query(sql, function (err, data, fields) {
                            if (!err) {
                                let temp = [];
                                for (let i = 0; i < data.length; i++) {
                                    temp = temp.concat(data[i].permissions);
                                }
                                resolve(temp)
                            } else {
                                var error = {
                                    title: 'Backend server error',
                                    message: "Failed to get config's group shares.",
                                    errorID: randomUUID()
                                }
                                res.statusCode = 501;
                                res.json({
                                    error: error
                                })
                                error.details = err;
                                error.userEmail = req.authInfo.preferred_username;
                                error.action = "Config actions (/configs)";
                                error.originalUrl = req._parsedUrl.pathname;
                                error.requestParams = JSON.stringify(req.body);
                                error.location = getLineLocation();
                                errorLog(error)
                            }
                        })
                    })
                }

                let maxPermission = 0;
                let perms = ["Read", "Edit", "Apply", "Full"];
                for (let i = 0; i < permissionList.length; i++) {
                    let perm = permissionList[i];
                    let permIndex = perms.indexOf(perm);
                    maxPermission = permIndex > maxPermission ? permIndex : maxPermission;
                }

                switch (saveMethod) {
                    case "Plan/Apply":
                        if (planApply === "Plan") {
                            canExecute = maxPermission >= 1 ? true : false;
                        } else if (planApply === "Apply") {
                            canExecute = maxPermission >= 2 ? true : false;
                        }
                        break;
                    case "Destroy":
                        canExecute = maxPermission >= 2 ? true : false;
                        break;
                    case "Delete":
                        canExecute = maxPermission >= 3 ? true : false;
                        break;
                    default:
                        break;
                }

            }
        }

        if (canExecute) {
            // Get the credentials
            let creds = {};
            if (provider === 'aws') {
                sql = `SELECT fa_access_key,fa_secret FROM aws_accounts WHERE (account_name = (SELECT account FROM configs WHERE config_uuid=\'${configUUID}\'));`
                let credentials = await new Promise((resolve) => {
                    let lineLocation = getLineLocation();
                    db.query(sql, function (err, data, fields) {
                        if (!err) {
                            if (data.length !== 1) {
                                var error = {
                                    title: 'Backend server error',
                                    message: 'Found multiple credentials for this entry.',
                                    errorID: randomUUID()
                                }
                                res.statusCode = 501;
                                res.json({
                                    error: error
                                })
                                error.details = err;
                                error.userEmail = userEmail;
                                error.action = "Config Actions (/modify-config)";
                                error.location = lineLocation;
                                error.originalUrl = req._parsedUrl.pathname;
                                error.requestParams = JSON.stringify(req.query);
                                errorLog(error);
                            }
                            resolve(data)
                        } else {
                            var error = {
                                title: 'Backend server error',
                                message: 'Failed to retieve saved credentials.',
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = userEmail;
                            error.action = "Config Actions (/modify-config)";
                            error.location = lineLocation;
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.query);
                            errorLog(error);
                        }
                    })
                });
                creds = {
                    accessKey: credentials[0].fa_access_key,
                    secretKey: credentials[0].fa_secret
                }
            } else if (provider === 'aws') {
                sql = `SELECT application_id,secret_value FROM az_subscriptions WHERE (subscription_name = (SELECT account FROM configs WHERE config_uuid=\'${configUUID}\'));`
                let credentials = await new Promise((resolve) => {
                    let lineLocation = getLineLocation();
                    db.query(sql, function (err, data, fields) {
                        if (!err) {
                            if (data.length !== 1) {
                                var error = {
                                    title: 'Backend server error',
                                    message: 'Found multiple credentials for this entry.',
                                    errorID: randomUUID()
                                }
                                res.statusCode = 501;
                                res.json({
                                    error: error
                                })
                                error.details = err;
                                error.userEmail = userEmail;
                                error.action = "Config Actions (/modify-config)";
                                error.location = lineLocation;
                                error.originalUrl = req._parsedUrl.pathname;
                                error.requestParams = JSON.stringify(req.query);
                                errorLog(error);
                            }
                            resolve(data)
                        } else {
                            var error = {
                                title: 'Backend server error',
                                message: 'Failed to retieve saved credentials.',
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = userEmail;
                            error.action = "Config Actions (/modify-config)";
                            error.location = lineLocation;
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.query);
                            errorLog(error);
                        }
                    })
                });
                creds = {
                    accessKey: credentials[0].application_id,
                    secretKey: credentials[0].secret_value
                }
            }

            let status = "";
            switch (saveMethod) {
                case "Delete":
                    try {
                        let status = "Deleting"
                        sql = `UPDATE configs SET modified_at = NOW(), modified_by = \'${userEmail}\', status = \'${status}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });

                        if (terraformEnv === "local") {
                            const tfProvidersFolder = getAbsProvidersPath();
                            const tfInitCommand = `cd ${tfConfigFolder} && \
                                if [ ! -d './.terraform' ]; then terraform providers lock -fs-mirror=${tfProvidersFolder} && terraform init; fi`;

                            let terraDestroyCommand = '';
                            if (provider === 'aws') {
                                terraDestroyCommand = `cd ${tfConfigFolder} && \
                                    export AWS_ACCESS_KEY_ID=${creds.accessKey} && export AWS_SECRET_ACCESS_KEY=${creds.secretKey} && \
                                    terraform destroy -no-color -auto-approve 2> ../lastError.log || \
                                    ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                    cat ../lastError.log >&2 && exit 1 )`;

                            } else if (provider === 'az') {
                                terraDestroyCommand = `cd ${tfConfigFolder} && \
                                    export ARM_CLIENT_ID=${creds.accessKey} && export ARM_CLIENT_SECRET=${creds.secretKey} && \
                                    terraform destroy -no-color -auto-approve 2> ../lastError.log || \
                                    ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                    cat ../lastError.log >&2 && exit 1 )`;
                            }

                            const removeDirCommand = `rm -rf ${configFolder}`;
                            await Promise.resolve()
                                .then(makeExec(tfInitCommand))
                                .then(makeExec(terraDestroyCommand))
                                .then(makeExec(removeDirCommand))
                        } else if (terraformEnv === "docker") {
                            const allConfigsFolder = absRootFilePath
                            const dockerRunCommand =
                                `docker run --rm \
                                    -v "${allConfigsFolder}":/configs \
                                    --name ec2c-tf-job-${configUUID}-destroy \
                                    ec2c-terraform-job ${configUUID} destroy ${provider} ${creds.accessKey} ${creds.secretKey}`
                            const removeDirCommand = `rm -rf ${configFolder}`;
                            await Promise.resolve()
                                .then(makeExec(dockerRunCommand))
                                .then(makeExec(removeDirCommand))
                        } else if (terraformEnv === "kubernetes") {
                            var lineLocation = getLineLocation();
                            let kubeHelper = {};
                            kubeHelper.i = new KubernetesHelper()
                            let jobStatus = '';
                            try {
                                jobStatus = await kubeHelper.i.createTfJob(configUUID, 'destroy', 'default', provider, creds.accessKey, creds.secretKey);
                                kubeHelper.i = null;
                                delete kubeHelper.i
                                const removeDirCommand = `rm -rf ${configFolder}`;
                                await Promise.resolve()
                                    .then(makeExec(removeDirCommand))
                            } catch (error) {
                                const errorFile = path.join(configFolder, 'lastError.log')
                                const lastError = fs.readFileSync(errorFile, 'utf8');
                                throw lastError
                            }
                        }

                        sql = `DELETE FROM configs WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    var error = {
                                        title: 'Backend server error',
                                        message: `Failed to delete the database entry. Contact your administrator. Config ID: ${configUUID}`,
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });

                        sql = `DELETE FROM config_shares WHERE (id IN \
                            (SELECT id from config_shares WHERE config_uuid = \'${configUUID}\'));`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (err) {
                                    var error = {
                                        title: 'Backend server error',
                                        message: 'Failed to delete the shares from the database.',
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                } else {
                                    resolve("OK")
                                }
                            })
                        });

                        res.json({
                            data: {}
                        })

                    } catch (err) {
                        let status = "Failed to delete"
                        sql = `UPDATE configs SET modified_at = NOW(), modified_by = \'${userEmail}\', status = \'${status}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });
                        const lastErrorFile = `${configFolder}/lastError.log`;
                        const errorLogText = fs.readFileSync(lastErrorFile);
                        var error = {
                            title: 'Configuration error',
                            message: `${errorLogText}`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        throw err;
                    }
                    break;

                case "Plan/Apply":
                    try {
                        sql = `SELECT status FROM configs WHERE (config_uuid = \'${configUUID}\');`
                        let currentStatus = await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (err) {
                                    var error = {
                                        title: 'Backend server error',
                                        message: 'Failed to fetch current status of the config.',
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                } else {
                                    resolve(data[0].status)
                                }
                            })
                        });
                        if (planApply === "Plan") {
                            status = "Planning";
                        } else {
                            status = "Applying";
                        }
                        sql = `UPDATE configs SET modified_at = NOW(), status = \'${status}\', modified_by = \'${userEmail}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });
                        if (planApply === "Plan") {
                            if (terraformEnv === 'local') {
                                const tfProvidersFolder = getAbsProvidersPath();
                                const tfInitCommand = `cd ${tfConfigFolder} && \
                                    if [ ! -d './.terraform' ]; then terraform providers lock -fs-mirror=${tfProvidersFolder} && terraform init; fi`;

                                let terraPlanCommand = '';
                                if (provider === 'aws') {
                                    terraPlanCommand = `cd ${tfConfigFolder} && \
                                        export AWS_ACCESS_KEY_ID=${creds.accessKey} && export AWS_SECRET_ACCESS_KEY=${creds.secretKey} && \
                                        terraform plan -no-color -out=tfplan > ../planLog.txt 2> ../lastError.log || \
                                        ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                        cat ../lastError.log >&2 && exit 1 )`

                                } else if (provider === 'az') {
                                    terraPlanCommand = `cd ${tfConfigFolder} && \
                                        export ARM_CLIENT_ID=${creds.accessKey} && export ARM_CLIENT_SECRET=${creds.secretKey} && \
                                        terraform plan -no-color -out=tfplan > ../planLog.txt 2> ../lastError.log || \
                                        ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                        cat ../lastError.log >&2 && exit 1 )`
                                }

                                await Promise.resolve()
                                    .then(makeExec(tfInitCommand))
                                    .then(makeExec(terraPlanCommand))

                            } else if (terraformEnv === "docker") {
                                const allConfigsFolder = absRootFilePath
                                const dockerRunCommand =
                                    `docker run --rm \
                                        -v "${allConfigsFolder}":/configs \
                                        --name ec2c-tf-job-${configUUID}-plan \
                                        ec2c-terraform-job ${configUUID} plan ${provider} ${creds.accessKey} ${creds.secretKey}`
                                await Promise.resolve()
                                    .then(makeExec(dockerRunCommand))
                            } else if (terraformEnv === "kubernetes") {
                                var lineLocation = getLineLocation();
                                let kubeHelper = {};
                                kubeHelper.i = new KubernetesHelper()
                                let jobStatus = '';
                                try {
                                    jobStatus = await kubeHelper.i.createTfJob(configUUID, 'plan', 'default', provider, creds.accessKey, creds.secretKey);
                                    kubeHelper.i = null;
                                    delete kubeHelper.i
                                } catch (error) {
                                    const errorFile = path.join(configFolder, 'lastError.log')
                                    const lastError = fs.readFileSync(errorFile, 'utf8');
                                    throw lastError
                                }
                            }

                            if (!currentStatus.includes("Planned")) {
                                status = currentStatus + " / Planned";
                            } else {
                                status = currentStatus;
                            }
                        } else {
                            if (terraformEnv === 'local') {
                                const tfProvidersFolder = getAbsProvidersPath();
                                const tfInitCommand = `cd ${tfConfigFolder} && \
                                    if [ ! -d './.terraform' ]; then terraform providers lock -fs-mirror=${tfProvidersFolder} && terraform init; fi`;

                                let terraApplyCommand = '';
                                if (provider === 'aws') {
                                    terraApplyCommand = `cd ${tfConfigFolder} && \
                                        export AWS_ACCESS_KEY_ID=${creds.accessKey} && export AWS_SECRET_ACCESS_KEY=${creds.secretKey} && \
                                        terraform apply -no-color tfplan 2> ../lastError.log || \
                                        ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                        cat ../lastError.log >&2 && exit 1 )`;

                                } else if (provider === 'az') {
                                    terraApplyCommand = `cd ${tfConfigFolder} && \
                                        export ARM_CLIENT_ID=${creds.accessKey} && export ARM_CLIENT_SECRET=${creds.secretKey} && \
                                        terraform apply -no-color tfplan 2> ../lastError.log || \
                                        ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                        cat ../lastError.log >&2 && exit 1 )`;
                                }

                                await Promise.resolve()
                                    .then(makeExec(tfInitCommand))
                                    .then(makeExec(terraApplyCommand))
                            } else if (terraformEnv === "docker") {
                                const allConfigsFolder = absRootFilePath
                                const dockerRunCommand =
                                    `docker run --rm \
                                        -v "${allConfigsFolder}":/configs \
                                        --name ec2c-tf-job-${configUUID}-apply \
                                        ec2c-terraform-job ${configUUID} apply ${provider} ${creds.accessKey} ${creds.secretKey}`
                                await Promise.resolve()
                                    .then(makeExec(dockerRunCommand))
                            } else if (terraformEnv === "kubernetes") {
                                var lineLocation = getLineLocation();
                                let kubeHelper = {};
                                kubeHelper.i = new KubernetesHelper()
                                let jobStatus = '';
                                try {
                                    jobStatus = await kubeHelper.i.createTfJob(configUUID, 'apply', 'default', provider, creds.accessKey, creds.secretKey);
                                    kubeHelper.i = null;
                                    delete kubeHelper.i
                                } catch (error) {
                                    const errorFile = path.join(configFolder, 'lastError.log')
                                    const lastError = fs.readFileSync(errorFile, 'utf8');
                                    throw lastError
                                }
                            }

                            status = "Applied"
                        }

                        sql = `UPDATE configs SET modified_at = NOW(), status = \'${status}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });

                        let planLog;
                        if (planApply === "Plan") {
                            planLog = fs.readFileSync(planLogFile, { encoding: 'utf8', flag: 'r' });
                        } else {
                            planLog = ""
                        }
                        res.json({
                            data: planLog
                        })

                    } catch (err) {
                        if (planApply === "Plan") {
                            status = "Failed to plan";
                        } else {
                            status = "Failed to apply";
                        }
                        sql = `UPDATE configs SET modified_at = NOW(), status = \'${status}\', modified_by = \'${userEmail}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });
                        const lastErrorFile = `${configFolder}/lastError.log`;
                        const errorLogText = fs.readFileSync(lastErrorFile);
                        var error = {
                            title: 'Configuration error',
                            message: `${errorLogText}`,
                            errorID: randomUUID()
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        error.details = `For more details, check the logs of the specific config: ${configUUID}`;
                        error.userEmail = req.authInfo.preferred_username;
                        error.action = "Config actions (/configs)";
                        error.originalUrl = req._parsedUrl.pathname;
                        error.requestParams = JSON.stringify(req.body);
                        error.location = getLineLocation();
                        errorLog(error)
                        throw err;
                    }
                    break;

                case "Destroy":
                    try {
                        status = "Destroying";
                        sql = `UPDATE configs SET modified_at = NOW(), status = \'${status}\', modified_by = \'${userEmail}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    console.log(err);
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });
                        try {
                            if (terraformEnv === 'local') {
                                const tfProvidersFolder = getAbsProvidersPath();
                                const tfInitCommand = `cd ${tfConfigFolder} && \
                                    if [ ! -d './.terraform' ]; then terraform providers lock -fs-mirror=${tfProvidersFolder} && terraform init; fi`;

                                let terraDestroyCommand = '';
                                if (provider === 'aws') {
                                    terraDestroyCommand = `cd ${tfConfigFolder} && \
                                        export AWS_ACCESS_KEY_ID=${creds.accessKey} && export AWS_SECRET_ACCESS_KEY=${creds.secretKey} && \
                                        terraform destroy -auto-approve 2> ../lastError.log || \
                                        ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                        cat ../lastError.log >&2 && exit 1 )`;

                                } else if (provider === 'az') {
                                    terraDestroyCommand = `cd ${tfConfigFolder} && \
                                        export ARM_CLIENT_ID=${creds.accessKey} && export ARM_CLIENT_SECRET=${creds.secretKey} && \
                                        terraform destroy -auto-approve 2> ../lastError.log || \
                                        ( echo "\n\n\`date\`" >> ../errorLog.log && sed 's/^/  /g' ../lastError.log >> ../errorLog.log && \
                                        cat ../lastError.log >&2 && exit 1 )`;
                                }

                                await Promise.resolve()
                                    .then(makeExec(tfInitCommand))
                                    .then(makeExec(terraDestroyCommand))
                            } else if (terraformEnv === "docker") {
                                const allConfigsFolder = absRootFilePath
                                const dockerRunCommand =
                                    `docker run --rm \
                                        -v "${allConfigsFolder}":/configs \
                                        --name ec2c-tf-job-${configUUID}-destroy \
                                        ec2c-terraform-job ${configUUID} destroy ${provider} ${creds.accessKey} ${creds.secretKey}`
                                await Promise.resolve()
                                    .then(makeExec(dockerRunCommand))
                            } else if (terraformEnv === "kubernetes") {
                                var lineLocation = getLineLocation();
                                let kubeHelper = {};
                                kubeHelper.i = new KubernetesHelper()
                                let jobStatus = '';
                                try {
                                    jobStatus = await kubeHelper.i.createTfJob(configUUID, 'destroy', 'default', provider, creds.accessKey, creds.secretKey);
                                    kubeHelper.i = null;
                                    delete kubeHelper.i
                                } catch (error) {
                                    const errorFile = path.join(configFolder, 'lastError.log')
                                    const lastError = fs.readFileSync(errorFile, 'utf8');
                                    throw lastError
                                }
                            }
                        } catch (err) {
                            const lastErrorFile = `${configFolder}/lastError.log`;
                            const errorLogText = fs.readFileSync(lastErrorFile);
                            var error = {
                                title: 'Configuration error',
                                message: `${errorLogText}`,
                                errorID: randomUUID()
                            }
                            res.statusCode = 501;
                            res.json({
                                error: error
                            })
                            error.details = err;
                            error.userEmail = req.authInfo.preferred_username;
                            error.action = "Terraform syntax error (/aws)";
                            error.location = lineLocation;
                            error.originalUrl = req._parsedUrl.pathname;
                            error.requestParams = JSON.stringify(req.body);
                            throw error
                        }

                        status = "Destroyed"
                        sql = `UPDATE configs SET modified_at = NOW(), status = \'${status}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    console.log(err);
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });
                        res.json({
                            data: {}
                        })
                    } catch (err) {
                        status = "Failed to destroy";
                        sql = `UPDATE configs SET modified_at = NOW(), status = \'${status}\', modified_by = \'${userEmail}\' WHERE (config_uuid = \'${configUUID}\');`
                        await new Promise((resolve) => {
                            db.query(sql, function (err, data, fields) {
                                if (!err) {
                                    resolve(data)
                                } else {
                                    console.log(err);
                                    var error = {
                                        title: 'Backend server error',
                                        message: "Failed to update database.",
                                        errorID: randomUUID()
                                    }
                                    res.statusCode = 501;
                                    res.json({
                                        error: error
                                    })
                                    error.details = err;
                                    error.userEmail = req.authInfo.preferred_username;
                                    error.action = "Config actions (/configs)";
                                    error.originalUrl = req._parsedUrl.pathname;
                                    error.requestParams = JSON.stringify(req.body);
                                    error.location = getLineLocation();
                                    errorLog(error)
                                }
                            })
                        });
                        var error = {
                            title: 'Configuration error',
                            message: err.stderr
                        }
                        res.statusCode = 501;
                        res.json({
                            error: error
                        })
                        throw err;
                    }
                    break;
            }
        } else {
            var error = {
                title: "Not enough permissions",
                message: "Please contact an app administrator or the config owner.",
                errorID: randomUUID()
            }
            res.statusCode = 501;
            res.json({
                error: error
            })
            error.details = "Not enough permissions to execute this action";
            error.userEmail = req.authInfo.preferred_username;
            error.action = "Config actions (/configs)";
            error.originalUrl = req._parsedUrl.pathname;
            error.requestParams = JSON.stringify(req.body);
            error.location = getLineLocation();
            authLog(error)
            throw (error)
        }

    } catch (error) {
        console.log(error)
    }
}
