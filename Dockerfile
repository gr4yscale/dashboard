FROM node:4.4.4

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY build/server_built.js /usr/src/app/server.js
COPY public /usr/src/app/public

EXPOSE 8080
ENV NODE_ENV production
CMD [ "node", "server.js" ]
