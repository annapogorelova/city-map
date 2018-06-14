FROM node:10

WORKDIR /home/node/city-map

COPY ./package*.json ./

RUN npm install

RUN mkdir -p ./logs/

COPY ./ ./

#RUN chown -R node ./logs/
#RUN chmod -R +rw ./logs/

USER node

CMD [ "npm", "start" ]