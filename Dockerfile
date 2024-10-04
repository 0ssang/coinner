FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./d
RUN npm install
COPY . .
CMD [ "node", "src/app.js" ]