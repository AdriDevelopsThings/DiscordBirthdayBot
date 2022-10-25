FROM node:16
WORKDIR /app

ARG TRADUORA_API_CLIENT_ID=""
ARG TRADUORA_API_CLIENT_SECRET=""
ARG TRADUORA_API_PROJECT_ID=""

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn install --prod --pure-lockfile

COPY ./src ./src
COPY ./migrations ./migrations
COPY ./download_locales.js .
COPY ./knexfile.js .
COPY ./docker_start.sh .
RUN chmod a+x docker_start.sh

RUN yarn run download_locales

CMD ["/app/docker_start.sh"]