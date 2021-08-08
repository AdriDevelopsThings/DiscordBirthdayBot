/* 
 *  DiscordBirthdayBot
 *  Copyright (C) 2021  AdriDoesThings & PhilippIRL
 *  
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *  
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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