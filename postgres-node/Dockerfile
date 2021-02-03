# Build Container
FROM node:10.19.0

WORKDIR /build

COPY package-lock.json package.json ./

RUN npm ci

COPY . .

# Runtime container
FROM alpine

RUN apk add --update nodejs

RUN addgroup -S node && adduser -S node -G node 

USER node

RUN mkdir /home/node/emailer

WORKDIR /home/node/emailer

COPY --from=0 --chown=node:node /build .

CMD ["node", "server.js"]