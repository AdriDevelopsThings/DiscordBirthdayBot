import { Client, Intents } from 'discord.js'
import { registerCommands, handleCommand, commands } from './commands/index.js'

export const client = new Client({ intents: [Intents.FLAGS.GUILDS] })


client.once('ready', async () => {
    console.log('Bot is up and running')
    if (!client.application.owner) await client.application.fetch();
    registerCommands()
})


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
        // TODO
    } else {
        // TODO ERROR HANDLER
        handleCommand(interaction)
    }
})