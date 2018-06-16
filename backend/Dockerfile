FROM node:10

WORKDIR /home/node/city-map

COPY ./package*.json ./

RUN npm install

COPY --chown=node:node ./ ./

USER node:node

CMD [ "npm", "start" ]