# EC2 Configs application

## Overview

EC2 Configs is an web application that stores configurations of deployments of network objects in Azure and AWS. It provides a GUI to create, modify and apply or delete these sets of items in a few steps. It can manage multiple accounts and subsrcriptions, as long as you have access to these items and you can provide the essential credentials to the application's database. Its data is persistent between users and sessions, meaning that you can edit configurations that previously made at any time. Users are authenticated via Entra ID, and based on their Entra groups can be either categorized as admins or simple users.

## Deployment Methods

The application can be hosted in various ways:
- Hosted natively on one host
- Hosted on multiple hosts for HA
- Hosted on multiple hosts for HA, with different workloads split between different 'host groups'
- Containerized in a docker environment
- Containerized in a kubernetes cluster

In all production deployment methods, a reverse proxy is used to simplify certificate management and ssl termination, and enable HA in the scenarios that is needed. Direct access to all components via HTTP can be achieved, but it is highly discouraged.

## Prerequisites


- Depending on the deployment method you choose, you will need the corresponding amount of hosts configured. More info on the deployment procedure can be found here
- An Entra ID tenant with an application configured for authenticating users against the application
- Credentials for service accounts for all the subsrciptions/accounts you want to manage with this application

## Deployment

This repo also provides deployment instructions for a single host scenario, where one host is used to host all off the application's workloads. This is the quickest way to setup or test the application. Instruction for the setup of each workload environment is present in the corresponding folders.