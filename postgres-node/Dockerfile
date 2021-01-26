FROM node:10.19.0

USER node

RUN mkdir /home/node/emailer

WORKDIR /home/node/emailer

COPY --chown=node:node . ./

RUN npm ci

CMD ["node","server.js"]

