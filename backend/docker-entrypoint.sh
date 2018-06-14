#!/bin/bash

if [ ! -f .initialized ]; then
    echo "Initializing container"
    chown -R node:node /home/node/city-map/logs/
    chmod -R +rw /home/node/city-map/logs/
    touch .initialized
fi

exec "$@"