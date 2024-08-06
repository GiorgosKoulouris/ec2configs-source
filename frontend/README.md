# EC2 Configs - Frontend application

## Overview

This is the frontend section of the application. It is a web application written in javascript using, among others, the React framework. On top of the UI presentation to the user, it also handles the initial login and token retreival from Azure. It also performs some validation before proceeding to any action. in order to reduce the amount of api calls to the backend application.

## Deployment

This section provides a brief overview on how you can deploy the frontend on your host. These instructions refer to the simple deployment method (single host). More info on the other hosting methods, or deployment automation can be found on the deplolyment section.

### Prerequisites

You will need a linux host with node and npm installed. Internet access is needed in order to download necessary content. If you intend to build the application in static html, css and js files (highly recommended), you will also need nginx, or any other equivalent installed too.

```bash
# Navigate to this directory first

# Install npm dependencies
./00-app-actions.sh -i

# Create environment file template
./00-app-actions.sh -t
```

To run the application without building it:
```bash
npm start
```

To build the application into static files that can be served through nginx etc, execute the following:
```bash
npm run build
```

After the build, you will need to configure the web server accordingly. Refer to the web server's documentation, or follow the automated deployment in the **deployments** section of this repo.