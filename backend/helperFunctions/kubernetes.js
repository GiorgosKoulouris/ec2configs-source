require('dotenv').config();
const { KubeConfig, Client1_13 } = require('kubernetes-client');
const Request = require('kubernetes-client/backends/request')
const getKubeFile = require('./env').getKubernetesConfigFile;
const getAppEnvironment = require('./env').getAppEnvironment;
const getKubernetesConfigJsonString = require('./env').getKubernetesConfigJsonString;

exports.KubernetesHelper = class {

    constructor() {
        this.intervalID = '';
        this.getClient = this.getClient.bind(this);
        this.createTfJob = this.createTfJob.bind(this);
        this.createPyJob = this.createPyJob.bind(this);
        this.stopInterval = this.stopInterval.bind(this);
    }

    stopInterval() {
        var highestTimeoutId = setTimeout(";");
        for (var i = 0; i < highestTimeoutId; i++) {
            clearTimeout(i);
        }
    }

    getClient() {
        const kubeconfig = new KubeConfig();

        const appEnv = getAppEnvironment();
        if (appEnv === 'kubernetes') {
            let json = getKubernetesConfigJsonString();
            kubeconfig.loadFromString(json)
        } else {
            const kubeConfigFile = getKubeFile();
            kubeconfig.loadFromFile(kubeConfigFile);
        }

        const backend = new Request({ kubeconfig })
        const client = new Client1_13({ backend, version: '1.13' })

        this.client = client;
    }

    createTfJob = async (configUUID, action, namespace) => {
        let jobName = `tf-job-${configUUID}-${action}`;
        let containerName = `tf-container-${configUUID}-${action}`;
        let image = "727845353620.dkr.ecr.eu-central-1.amazonaws.com/ec2c-terraform-job:latest";
        // let image = "ec2c-terraform-job:latest";
        let volumeName = "ec2c-configs-data";
        let imagePullSecret = "ec2c-regcreds";
        let fsGroup = 20 // 1001 / 20

        let jobConfig = {
            "apiVersion": "batch/v1",
            "kind": "Job",
            "metadata": {
                "name": jobName,
                "namespace": namespace
            },
            "spec": {
                "ttlSecondsAfterFinished": 5,
                "backoffLimit": 0,
                "template": {
                    "spec": {
                        "dnsPolicy": "None",
                        "dnsConfig": {
                          "nameservers": [
                            "1.1.1.1"
                          ]
                        },
                        "containers": [
                            {
                                "name": containerName,
                                "image": image,
                                "args": [
                                    configUUID,
                                    action
                                ],
                                "imagePullPolicy": "Always",
                                "volumeMounts": [
                                    {
                                        "name": volumeName,
                                        "mountPath": "/configs"
                                    }
                                ],
                                "securityContext": {
                                    "fsGroup": fsGroup,
                                    "allowPrivilegeEscalation": true
                                }
                            }
                        ],
                        "volumes": [
                            {
                                "name": volumeName,
                                "persistentVolumeClaim": {
                                    "claimName": volumeName
                                }
                            }
                        ],
                        "imagePullSecrets": [
                            {
                                "name": imagePullSecret
                            }
                        ],
                        "restartPolicy": "Never"
                    }
                }
            }
        }

        this.getClient();
        let client = this.client;
        try {
            await client.apis.batch.v1.namespaces(namespace).jobs(jobName).delete();
        } catch (error) {
            console.log('No jobs with the same name. Proceeding...')
        }
        try {
            await client.apis.batch.v1.namespaces('default').jobs.post({ body: jobConfig });
        } catch (error) {
            console.log(error)
        }
        let jobStatus = new Promise(function (resolve, reject) {
            setInterval(async () => {
                try {
                    let currentJob = await client.apis.batch.v1.namespaces(namespace).jobs(jobName).status.get();
                    if (currentJob.body.status.failed) {
                        reject()
                    } else if (currentJob.body.status.succeeded) {
                        resolve()
                    }
                } catch (error) {
                    reject()
                }
            }, 3000)
        })
        return jobStatus
    }

    createPyJob = async (provider, configUUID, configName, region, namespace) => {
        let jobName = `py-job-${configUUID}`;
        let containerName = `py-container-${configUUID}`;
        let image = "727845353620.dkr.ecr.eu-central-1.amazonaws.com/ec2c-python-job:latest";
        // let image = "ec2c-python-job:latest";
        let volumeName = "ec2c-configs-data";
        let imagePullSecret = "ec2c-regcreds";
        let fsGroup = 20 // 1001 / 20

        let args = []
        if (provider === 'aws') {
            args = [
                provider,
                configUUID,
                configName
            ]
        } else if (provider === 'az') {
            args = [
                provider,
                configUUID,
                configName,
                region
            ]
        }
        let jobConfig =
        {
            "apiVersion": "batch/v1",
            "kind": "Job",
            "metadata": {
                "name": jobName,
                "namespace": namespace
            },
            "spec": {
                "ttlSecondsAfterFinished": 5,
                "backoffLimit": 0,
                "template": {
                    "spec": {
                        "containers": [
                            {
                                "name": containerName,
                                "image": image,
                                "args": args,
                                "imagePullPolicy": "Always",
                                "volumeMounts": [
                                    {
                                        "name": volumeName,
                                        "mountPath": "/data"
                                    }
                                ],
                                "securityContext": {
                                    "fsGroup": fsGroup,
                                    "allowPrivilegeEscalation": true
                                },
                                "env": [
                                    {
                                        "name": "ENV",
                                        "value": "kubernetes"
                                    }
                                ]
                            }
                        ],
                        "volumes": [
                            {
                                "name": volumeName,
                                "persistentVolumeClaim": {
                                    "claimName": volumeName
                                }
                            }
                        ],
                        "imagePullSecrets": [
                            {
                                "name": imagePullSecret
                            }
                        ],
                        "restartPolicy": "Never"
                    }
                }
            }
        }

        this.getClient();
        let client = this.client;
        try {
            await client.apis.batch.v1.namespaces(namespace).jobs(jobName).delete();
        } catch (error) {
            console.log('No jobs with the same name. Proceeding...')
        }
        try {
            await client.apis.batch.v1.namespaces('default').jobs.post({ body: jobConfig });
        } catch (error) {
            console.log(error)
        }
        let jobStatus = new Promise(function (resolve, reject) {
            setInterval(async () => {
                try {
                    let currentJob = await client.apis.batch.v1.namespaces(namespace).jobs(jobName).status.get();
                    if (currentJob.body.status.failed) {
                        reject()
                    } else if (currentJob.body.status.succeeded) {
                        resolve()
                    }
                } catch (error) {
                    reject()
                }
            }, 3000)
        })
        return jobStatus
    }

}