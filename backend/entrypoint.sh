#!/bin/sh

groupmod -g $NODE_GID node
usermod -u $NODE_UID -g $NODE_GID node

su node -c "cd /home/node/app && node index.js"
