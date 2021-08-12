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
import { genUTCString } from '../date_utils.js'
import db from '../db.js'
import { fetchNewUsersOnGuild } from '../birthday_congratulation.js'

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
        await knex('guilds').insert({ created_at: Date.now(), last_modified: Date.now(), guild_id: guildId, timezone: 0, language: 'en', ...values })
    }
}

export const setNotificationChannelHandler = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId, true)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }))
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

export const disableServerNotificationsHandler = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId, true)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }))
        return
    }

    if (guildExists) {
        await db('guilds').where({ guild_id: interaction.guildId }).update({ notification_channel_id: null })
    }

    await interaction.reply(t('disable_notification_channel.success'))
}

export const modifyTimezoneHandler = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId, true)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }))
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
    const t = await getGuildTranslation(interaction.guildId)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }))
        return
    }

    const language = interaction.options.getString('language').toLowerCase()
    if (!Object.keys(LANGUAGES).includes(language)) {
        await interaction.reply((await getGuildTranslation(interaction.guildId))('language_set.doesnt_exist', { language , available_languages: Object.keys(LANGUAGES).join(', ') }))
    } else {
        await modifyServer(interaction.guildId, { language })
        await interaction.reply((getTranslation(language))('language_set.success', { language }))
    }
}

export const fixLeavedUsersCongratulations = async (interaction) => {
    const guildId = interaction.guild.id
    const t = await getGuildTranslation(guildId)

    if(!interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.reply(t('general.insufficient_permissions', { permissions: 'ADMINISTRATOR' }))
        return
    }

    console.log(`Fix leaved user congratulations on ${guildId}`)
    const memberIds = (await interaction.guild.members.fetch()).map(member => member.id)
    const userIds = (await db('notification_users').where({ guild_id: guildId }).select('user_id')).map(user => user.user_id)
    const leavedUsers = userIds.filter(userId => !memberIds.includes(userId))
    await db('notification_users').where({ guild_id: guildId }).whereIn('user_id', leavedUsers).del()
    await fetchNewUsersOnGuild(guildId, memberIds)
    await interaction.reply(t('fix_leaved_user_congratulations.success'))
}