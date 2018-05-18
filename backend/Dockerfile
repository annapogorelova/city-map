FROM node:10

WORKDIR /home/node/city-map

COPY ./package*.json ./

RUN npm install

COPY ./ ./

RUN chown -R node ./log/
RUN chmod -R +rw ./log/

USER node

CMD [ "npm", "start" ]