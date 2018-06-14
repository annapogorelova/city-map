FROM node:10

WORKDIR /home/node/city-map

COPY ./package*.json ./

RUN npm install

COPY ./ ./

COPY docker-entrypoint.sh ./

RUN chmod +x /home/node/city-map/docker-entrypoint.sh

ENTRYPOINT ["/home/node/city-map/docker-entrypoint.sh"]

USER node

CMD [ "npm", "start" ]