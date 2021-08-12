# DiscordBirthdayBot

### Command overview
[**Command overview**](https://github.com/AdriDevelopsThings/DiscordBirthdayBot-rewrite/wiki/Command-overview)
### Inviting and configuring BirthdayBot
[**Inviting and configuring BirthdayBot**](https://github.com/AdriDevelopsThings/DiscordBirthdayBot-rewrite/wiki/Inviting-and-configuring-BirthdayBot)


---

# Development / Local install guide
## Installation
Or install with docker: -> #Install-with-Docker
Install yarn: ``npm install -g yarn``

Clone the repository and run:
```sh
yarn install --production
```

Set the database environment variables (-> #Environments) and migrate the database:
```sh
yarn run knex --env production migrate:latest
```

(The docker image includes the required language files. If you run the bot yourself you don't have translations.)

## Run

```sh
yarn run start
```

## Environment variables

* DISCORD_TOKEN=Your discord bot token
* ENVIRONMENT=production (or development)
* MYSQL_HOST=
* MYSQL_PORT=
* MYSQL_DATABASE=
* MYSQL_USER=
* MYSQL_PASSWORD=

(If you want to use another database server as mysql look here [Knex documentation](https://knexjs.org/#Installation-client) and implement the configuration in knexfile.js->production and install the yarn package)

## Install with docker

1. Rename the docker-compose.yml.demo to docker-compose.yml.
2. Change the MYSQL_PASSWORD and change the BOT_TOKEN
3. Run with ``docker-compose up -d``