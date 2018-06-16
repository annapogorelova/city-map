#!/bin/bash

if [ ! -f .initialized ]; then
    echo "Initializing container"
    mkdir -p -m 755 /home/node/city-map/logs/
    touch .initialized
fi

exec "$@"