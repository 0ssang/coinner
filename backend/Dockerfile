FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Install nodemon globally
RUN npm install -g nodemon

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000

# 개발 모드 명령어를 설정.
# 개발 모드와 프로덕션 모드를 구분하는 ENTRYPOINT 설정
ENTRYPOINT ["sh", "-c", "if [ \"$NODE_ENV\" = 'development' ]; then nodemon src/app.js; else node src/app.js; fi"]