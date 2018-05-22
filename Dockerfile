FROM node:alpine

RUN apk add --update yarn
RUN yarn global add serve

WORKDIR /opt/app

ADD ./dist/glo /opt/app

EXPOSE 5000

ENTRYPOINT serve -s
