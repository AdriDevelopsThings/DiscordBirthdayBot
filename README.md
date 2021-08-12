# DiscordBirthdayBot &middot; ![workflow badge](https://shields.io/github/workflow/status/AdriDevelopsThings/DiscordBirthdayBot/Docker) ![issues open badge](https://shields.io/github/issues-raw/AdriDevelopsThings/DiscordBirthdayBot) ![last commit badge](https://shields.io/github/last-commit/AdriDevelopsThings/DiscordBirthdayBot)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

### Command overview
[**Command overview**](https://github.com/AdriDevelopsThings/DiscordBirthdayBot/wiki/Command-overview)
### Inviting and configuring BirthdayBot
[**Inviting and configuring BirthdayBot**](https://github.com/AdriDevelopsThings/DiscordBirthdayBot/wiki/Inviting-and-configuring-BirthdayBot)


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
* TOP_GG_TOKEN=Your TOP_GG token if you want to push the server count there.

(If you want to use another database server as mysql look here [Knex documentation](https://knexjs.org/#Installation-client) and implement the configuration in knexfile.js->production and install the yarn package)

## Install with docker

1. Rename the docker-compose.yml.demo to docker-compose.yml.
2. Change the MYSQL_PASSWORD and change the BOT_TOKEN
3. Run with ``docker-compose up -d``
## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://adridoesthings.com"><img src="https://avatars.githubusercontent.com/u/45321107?v=4?s=100" width="100px;" alt=""/><br /><sub><b>AdriDevelopsThings</b></sub></a><br /><a href="https://github.com/AdriDevelopsThings/DiscordBirthdayBot/commits?author=AdriDevelopsThings" title="Code">💻</a></td>
    <td align="center"><a href="https://gitlab.com/PhilippIRL"><img src="https://avatars.githubusercontent.com/u/18361153?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Philipp</b></sub></a><br /><a href="https://github.com/AdriDevelopsThings/DiscordBirthdayBot/commits?author=PhilippIRL" title="Code">💻</a> <a href="#translation-PhilippIRL" title="Translation">🌍</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!