FROM node:10

WORKDIR /home/node/city-map

COPY ./package*.json ./

RUN npm install

COPY --chown=node:node ./ ./

COPY docker-entrypoint.sh ./

RUN chmod +x /home/node/city-map/docker-entrypoint.sh

USER node:node

ENTRYPOINT ["/home/node/city-map/docker-entrypoint.sh"]

CMD [ "npm", "start" ]