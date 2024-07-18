FROM node

WORKDIR /DESAFIOS

COPY package*.json ./

RUN npm install

COPY ./src ./src

EXPOSE 8081

CMD [ "npm", "start" ]