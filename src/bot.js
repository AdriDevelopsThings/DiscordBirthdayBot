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

import discordjs from 'discord.js'
import { registerCommands, handleCommand, handleSelectMenu } from './commands/index.js'
import { birthdayCongratulationAlgorythm, fetchNewUsersOnGuild, onGuildMemberJoin, onGuildMemberLeave } from './birthday_congratulation.js'
import { CONTACT_US_METHOD, ISSUE_URL } from './consts.js'
import { getGuildTranslation, getTranslation } from './lang.js'
import { generateRandomErrorCode } from './error_handler_utils.js'
import { onMessageReactionAddBirthdayCalendar } from './commands/birthday_calendar.js'
import { runFetchStats } from './stats.js'
import AutoPoster from 'topgg-autoposter'
import config from './config.js'

export const client = new discordjs.Client({ intents: [
    discordjs.GatewayIntentBits.Guilds,
    discordjs.GatewayIntentBits.GuildMembers,
    discordjs.GatewayIntentBits.GuildMessageReactions,
] })

if (config.top_gg_token) {
    AutoPoster(config.top_gg_token, client) 
}

client.once('ready', async () => {
    console.log('Bot is up and running')
    if (!client.application.owner) await client.application.fetch()
    await registerCommands()
    runFetchStats()
    birthdayCongratulationAlgorythm()
})


client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        // TODO ERROR HANDLER
        try {
            await handleCommand(interaction)
        } catch (e) {
            const errorCode = generateRandomErrorCode()

            console.error(`Error occured while '${interaction.commandName}' (${errorCode}): ${e}`)
            console.error(e.stack)
            let translate = getTranslation()
            try {
                translate = await getGuildTranslation(interaction.guild.id)
            } catch (e) {
                console.error(`Error while fetching guildTranslation while command error (${errorCode}) ${e}!`)
                console.error(e.stack)
            }
            
            const embed = new discordjs.EmbedBuilder()
                .setAuthor('Error Reporter', null, ISSUE_URL)
                .setTitle(translate('error_handler.error_occured'))
                .setDescription('🔴🔴🔴🔴🔴')
                .setColor(13572399)
            embed.addFields(translate('error_handler.what_happend'), translate('error_handler.error_occured_happend_description'))
            embed.addFields(translate('error_handler.what_should_i_do'), translate('error_handler.what_should_i_do_description', {
                issue: ISSUE_URL,
                contact: CONTACT_US_METHOD,
            }))
            embed.addFields(translate('error_handler.error_code'), errorCode)
            try {
                await interaction.reply({ embeds: [embed] })
                console.log('Error message sent.')
            } catch (e) {
                console.error('----- !!! -----')
                console.error(`Sending error message failed (${errorCode}) ${e}!`)
                console.error(e.stack)
                console.error('----- !!! -----')
            }
        }
    } else if(interaction.isSelectMenu()) {
        try {
            if(interaction.customId) {
                await handleSelectMenu(interaction)
            }
        } catch(e) {
            console.error('Failed to handle select menu interaction', e)
        }
    }
})

const runEventWithErrorHandling = async (handler, args) => {
    try {
        await handler(...args)
    } catch (e) {
        console.error(`Error while handling event ${handler} with args ${args}: ${e}.`)
        console.error(e.stack)
    }
}

client.on('guildCreate', async guild => {
    await runEventWithErrorHandling(fetchNewUsersOnGuild, [guild])
})

client.on('guildMemberAdd', async member => {
    await runEventWithErrorHandling(onGuildMemberJoin, [member])
})

client.on('guildMemberRemove', async member => {
    await runEventWithErrorHandling(onGuildMemberLeave, [member])
})

client.on('messageReactionAdd', async (reaction, user) => {
    await runEventWithErrorHandling(onMessageReactionAddBirthdayCalendar, [reaction, user])
})