# EC2 Configs - Backend application

## Overview

This application handles all the transactions in the backend of EC2 Configs. It is an api running in node, that serves http requests that come from the user's browser and processes them accordingly. In short, after receiving a request, the backend application:

- Authenticates and authorizes the user based on their Azure token and permissions set in the application
- Retreives all necessary data from the database and stores back all of the changes
- Whenever needed, calls the necessary subprocesses to facilitate the request (python or terraform)
- It handles all of the configurations, both in OS level (stored data) and DB level (stored configurations and information)

Since this api is publicly accessible, it authenticates and authorizes the users based on the token that is provided with each request. No actions are needed from user side for their authentication in the backend, as this token is retreived from Azure during their login into the app, and is automatically passed along with all of their requests in the api.

## Deployment

This section provides a brief overview on how you can deploy the backend application on your host. These instructions refer to the simple deployment method (single host). More info on the other hosting methods, or deployment automation can be found on the deplolyment section.

### Prerequisites

You will need a linux host with node, npm, terraform and python installed. Internet access is needed in order to download necessary content. If you use a reverse proxy (recommended), you will also need to configure it to point /api on this host on port 30002 via HTTP.

Before you start the app, you will need to make sure python is installed and the environment you're going to use has the necessary modules installed. See the **python** section for more info

You will also need to make sure that after the .env file modification, all the directories you specified for configs, logs and providers exist. Especially for the providers, you will need to mirror the AWS and Azure providers in order to establish consistency between the versions used by the configurations and reduce execution time due to multiple donwloads. View more on the **terraform** section.
### Deploy

```bash
# Navigate to this directory first

# Install npm dependencies
./00-app-actions.sh -i

# Create environment file templates
./00-app-actions.sh -t

# If you run on foreground with node
node index.js

# If you use systemd to manage tha backend
sudo -i
cp ec2c.service.template /etc/system/systemd/ec2c.service
systemctl daemon-reload
systemctl restart ec2c
```