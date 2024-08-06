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
    const file = join(folder, 'config.json')
    return file
}
exports.getKubernetesConfigJsonString = () => {
    const base64String = process.env.KUBE_CONF_B64;
    return base64String
}