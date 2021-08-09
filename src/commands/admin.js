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

import knex from '../db.js'
import { getTranslation, getGuildTranslation, LANGUAGES } from '../lang.js'

const modifyServer = async (guildId, values, guildExists=null) => {
    if (guildExists === null) {
        guildExists = (await knex('guilds')
            .select('id')
            .where({guild_id: guildId}))
            .length !== 0
    }
    if (guildExists) {
        await knex('guilds').where({ guild_id: guildId }).update({ last_modified: Date.now(), ...values })
    } else {
        await knex('guilds').insert({ created_at: Date.now(), last_modified: Date.now(), timezone: 0, language: 'en', ...values })
    }
}

const genUTCString = offset => {
    if(offset < 0) {
        return `UTC${offset}`
    } else if(offset > 0) {
        return `UTC+${offset}`
    } else {
        return 'UTC'
    }
}

export const setNotificationChannelHandler = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions'))
        return
    }

    const channel = interaction.options.getChannel('channel')

    if(!channel.isText()) {
        await interaction.reply(t('set_notification_channel.error_channel_type'))
        return
    }

    await modifyServer(interaction.guildId, { notification_channel_id: channel.id }, guildExists)

    await interaction.reply(t('set_notification_channel.success', {channel: `<#${channel.id}>`}))
}

export const modifyTimezoneHandler = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions'))
        return
    }

    let timezoneString = interaction.options.getString('timezone').toLowerCase().replace('gmt', 'utc')
    if (timezoneString == 'utc' || timezoneString == 'utc0') {
        timezoneString = 'utc+0'
    } else if(!timezoneString.startsWith('utc')) {
        timezoneString = 'utc' + timezoneString
    }

    if (timezoneString.length != 5) {
        await interaction.reply(t('timezone_set.wrong_syntax'))
        return
    }

    const timezone = parseInt(timezoneString.substr(3))
    if (timezone < -12 || timezone > 12) {
        await interaction.reply(t('timezone_set.wrong_timezone'))
        return
    }

    await modifyServer(interaction.guildId, { timezone }, guildExists)
    await interaction.reply(t('timezone_set.success', { timezone: genUTCString(timezone) }))
}

export const modifyLanguageHandler = async (interaction) => {
    const language = interaction.options.getString('language').toLowerCase()
    if (!Object.keys(LANGUAGES).includes(language)) {
        await interaction.reply((await getGuildTranslation(interaction.guildId))('language_set.doesnt_exist', { language , available_languages: Object.keys(LANGUAGES).join(', ') }))
    } else {
        await modifyServer(interaction.guildId, { language })
        await interaction.reply((getTranslation(language))('language_set.success', { language }))
    }
}
