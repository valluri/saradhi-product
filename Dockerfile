FROM node:10-alpine

RUN apk update && apk add --no-cache fontconfig curl curl-dev && \
    cd /tmp && curl -Ls https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz | tar xz && \
    cp -R lib lib64 / && \
    cp -R usr/lib/x86_64-linux-gnu /usr/lib && \
    cp -R usr/share /usr/share && \
    cp -R etc/fonts /etc && \
    curl -k -Ls https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 | tar -jxf - && \
    cp phantomjs-2.1.1-linux-x86_64/bin/phantomjs /usr/local/bin/phantomjs

RUN apk --no-cache add msttcorefonts-installer fontconfig && \
    update-ms-fonts && \
    fc-cache -f

RUN mkdir /sk-saradhi-api && chown -R node:node /sk-saradhi-api
WORKDIR /sk-saradhi-api

COPY --chown=node:node package*.json ./


RUN npm ci

COPY --chown=node:node . .

USER node
EXPOSE 3000

RUN npm run build && npm prune --production

COPY ./src/templates/invoice-template.ejs ./dist/src/templates/invoice-template.ejs

CMD ["npm", "start"]
