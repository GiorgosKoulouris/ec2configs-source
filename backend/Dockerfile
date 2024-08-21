FROM node:21-alpine

RUN mkdir -p /home/node/app/ && \
    mkdir /kube && chown -R node:node /kube && \
    mkdir -p /ec2c/data && chown -R node:node /ec2c/data && \
    mkdir -p /ec2c/logs && chown -R node:node /ec2c/logs

WORKDIR /home/node/app

RUN cd /home/node/app && npm install axios cors dotenv express @kubernetes/client-node mysql passport passport-azure-ad uuid && chown -R node:node /home/node/app

COPY --chown=node:node . .

EXPOSE 30002

LABEL maintainer="George Koulouris <gkoulouris@thecanopener.com>"
LABEL version="1.0.0"
LABEL project="EC2 Configs"

CMD [ "node", "index.js" ]