require('dotenv').config();
const getKubeFile = require('./env').getKubernetesConfigFile;
const getAppEnvironment = require('./env').getAppEnvironment;

const k8s = require('@kubernetes/client-node');

exports.KubernetesHelper = class {

    constructor() {
        this.intervalID = '';
        this.getApi = this.getApi.bind(this);
        this.createTfJob = this.createTfJob.bind(this);
        this.createPyJob = this.createPyJob.bind(this);
        this.waitForJobCompletion = this.waitForJobCompletion.bind(this);
        this.sleep = this.sleep.bind(this);
    }

    sleep = async (ms) => {
        return new Promise((resolve) => {
          setTimeout(resolve, ms);
        });
      }

    getApi = async () => {
        const kc = new k8s.KubeConfig();

        let appEnv = getAppEnvironment();
        if (appEnv === 'local') {
            kc.loadFromFile(getKubeFile());
        } else {
            kc.loadFromDefault();
        }
        const k8sBatchApi = kc.makeApiClient(k8s.BatchV1Api);
        return k8sBatchApi;
    }

    waitForJobCompletion = async (jobName, namespace, k8sApi) => {
        return new Promise((resolve, reject) => {
            async function checkJobStatus() {
                try {
                    const res = await k8sApi.readNamespacedJob(jobName, namespace);
                    const currentJob = res.body;

                    if (currentJob.status.active) {
                    } else if (currentJob.status.succeeded) {
                        console.error(`Job ${jobName} succeeded.`);
                        resolve();
                        clearInterval(this.intervalId);
                    } else if (currentJob.status.failed) {
                        console.error(`Job ${jobName} failed.`);
                        reject();
                        clearInterval(this.intervalId);
                    }
                } catch (err) {
                    console.log(`Failed to check job ${jobName} status: ${err.message}`);
                    reject(new Error(`Failed to check job ${jobName} status: ${err.message}`));
                    clearInterval(this.intervalId);
                }
            }

            this.intervalId = setInterval(checkJobStatus, 5000);
        });
    }

    createTfJob = async (configUUID, action, namespace) => {
        const jobName = `tf-job-${configUUID}-${action}`;
        const containerName = `tf-container-${configUUID}-${action}`;
        const image = "ec2c-terraform-job:latest";
        const volumeName = "ec2c-configs-data";
        const fsGroup = 20 // 1001 / 20

        let jobConfig = {
            "ttlSecondsAfterFinished": 300,
            "backoffLimit": 0,
            "template": {
                "spec": {
                    "containers": [
                        {
                            "name": containerName,
                            "image": image,
                            "args": [
                                configUUID,
                                action
                            ],
                            "imagePullPolicy": "Never",
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
                    "restartPolicy": "Never"
                }
            }
        }

        let k8sBatchApi = await this.getApi();

        const job = new k8s.V1Job();
        job.apiVersion = 'batch/v1';
        job.kind = 'Job';

        const metadata = new k8s.V1ObjectMeta();
        metadata.name = jobName;
        job.metadata = metadata;
        job.spec = jobConfig

        try {
            try {
                const delRes = await k8sBatchApi.deleteNamespacedJob(jobName, namespace)
                await this.sleep(2000);
            } catch (error) {
                console.log(`No jobs named ${jobName}. Proceeding...`)
            }

            try {
                const response = await k8sBatchApi.createNamespacedJob(namespace, job);
            } catch (error) {
                console.error(`Error creating job: ${jobName}\n`, error);
                throw error
            }

            let jobStatus = await this.waitForJobCompletion(jobName, namespace, k8sBatchApi)
                .then((message) => {
                    return new Promise((resolve, reject) => {
                        resolve();
                    });
                })
                .catch((err) => {
                    return new Promise((resolve, reject) => {
                        reject();
                    });
                });

            return jobStatus

        } catch (error) {
            return new Promise((resolve, reject) => {
                reject();
            });
        }
    }

    createPyJob = async (provider, configUUID, configName, region, namespace) => {
        const jobName = `py-job-${configUUID}`;
        const containerName = `py-container-${configUUID}`;
        const image = "ec2c-python-job:latest";
        const volumeName = "ec2c-configs-data";
        const fsGroup = 20 // 1001 / 20

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
        let jobConfig = {
            "ttlSecondsAfterFinished": 300,
            "backoffLimit": 0,
            "template": {
                "spec": {
                    "containers": [
                        {
                            "name": containerName,
                            "image": image,
                            "args": args,
                            "imagePullPolicy": "Never",
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
                    "restartPolicy": "Never"
                }
            }
        }

        let k8sBatchApi = await this.getApi();

        const job = new k8s.V1Job();
        job.apiVersion = 'batch/v1';
        job.kind = 'Job';

        const metadata = new k8s.V1ObjectMeta();
        metadata.name = jobName;
        job.metadata = metadata;
        job.spec = jobConfig

        try {
            const delRes = await k8sBatchApi.deleteNamespacedJob(jobName, namespace)
            await this.sleep(2000);
        } catch (error) {
            console.log(`No jobs named ${jobName}. Proceeding...`)
        }

        try {
            const response = await k8sBatchApi.createNamespacedJob(namespace, job);
            console.log(`Job created: ${jobName}\n`);
        } catch (error) {
            console.error(`Error creating job: ${jobName}\n`, error);
        }
    }
}

