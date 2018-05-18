FROM node:10 as node

WORKDIR /home/node/city-map/

COPY ./package*.json ./

RUN npm install

COPY ./ ./

RUN npm run build

FROM nginx:1.13

COPY --from=node /home/node/city-map/dist/ /var/www/city-map/

COPY ./docker/ /etc/nginx/conf.d/