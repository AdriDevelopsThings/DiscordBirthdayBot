import { client } from './bot.js'



if (!process.env.DISCORD_TOKEN) {
    console.error('Please set the \'DISCORD_TOKEN\' environment variable to your discord bot token.')
    process.exit(1)
}

client.login(process.env.DISCORD_TOKEN)
