var resolve = require('path').resolve;
var join = require('path').join;

exports.getAbsDataPath = () => {
    const env = process.env.APP_ENV;
    if (env !== 'local') {
        return '/ec2c/data'
    } else {
        let filePath = resolve(process.env.HOST_DATA_ROOT_FOLDER);
        return filePath
    }
}
exports.getAbsLogPath = () => {
    const env = process.env.APP_ENV;
    if (env !== 'local') {
        return '/ec2c/logs'
    } else {
        let filePath = resolve(process.env.HOST_DATA_LOGS_FOLDER);
        return filePath
    }
}
exports.getAbsProvidersPath = () => {
    const env = process.env.APP_ENV;
    if (env === 'local') {
        let filePath = resolve(process.env.HOST_DATA_PROVIDERS_FOLDER);
        return filePath
    } else return ''
}
exports.getAppEnvironment = () => {
    const env = process.env.APP_ENV;
    return env
}
exports.getPythonEnvironment = () => {
    let env = '';
    if (process.env.APP_ENV === 'local') {
        env = process.env.PYTHON_ENV;
    } else {
        env = 'kubernetes';
    }
    return env
}
exports.getPythonExec = () => {
    return process.env.PYTHON_EXEC;
}
exports.getPythonScriptFolder = () => {
    return resolve(process.env.PYTHON_SCRIPT_ROOT_PATH);
}
exports.getTerraformEnvironment = () => {
    let env = '';
    if (process.env.APP_ENV === 'local') {
        env = process.env.TERRAFORM_ENV;
    } else {
        env = 'kubernetes';
    }
    return env
}
exports.getKubernetesConfigFile = () => {
    let folder = ''
    let appEnv = process.env.APP_ENV;
    if (appEnv === 'local') {
        folder = process.env.KUBE_CONFIG_FOLDER;
    } else {
        folder = '/kube'
    }
    const file = join(folder, 'config')
    return file
}
exports.getKubernetesConfigJsonString = () => {
    const base64String = process.env.KUBE_CONF_B64;
    return base64String
}
exports.getKubernetesJobConfig = () => {
    let appEnv = process.env.APP_ENV;
    if (appEnv === 'kubernetes') {
        const kubeJobConfig = {
            serviceAccountName: process.env.KUBE_JOB_SA_NAME,
            images: {
                tf: process.env.KUBE_TF_IMAGE,
                py: process.env.KUBE_PY_IMAGE
            },
            imagePullPolicy: process.env.KUBE_IMAGE_PULL_POLICY,
            imagePullCreds: process.env.KUBE_IMAGE_PULL_CREDS,
            poduserID: {
                user: process.env.KUBE_PODUSERID_USER,
                group: process.env.KUBE_PODUSERID_GROUP
            },
            appDataVolumeName: process.env.KUBE_APPDATA_VOL_NAME
        }
        return kubeJobConfig        
    } else {
        return {}
    }
}