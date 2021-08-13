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
import { currentDateTimeToSQLFormat, genUTCString } from '../date_utils.js'
import db from '../db.js'
import { fetchNewUsersOnGuild } from '../birthday_congratulation.js'
import { MessageActionRow, MessageSelectMenu } from 'discord.js'

const modifyServer = async (guildId, values, guildExists=null) => {
    if (guildExists === null) {
        guildExists = (await knex('guilds')
            .select('id')
            .where({guild_id: guildId}))
            .length !== 0
    }
    if (guildExists) {
        await knex('guilds').where({ guild_id: guildId }).update({ last_modified: currentDateTimeToSQLFormat(), ...values })
    } else {
        await knex('guilds').insert({ created_at: currentDateTimeToSQLFormat(), last_modified: currentDateTimeToSQLFormat(), guild_id: guildId, timezone: 0, language: 'en', ...values })
    }
}

export const setNotificationChannelHandler = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId, true)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply({content: t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }), ephemeral: true})
        return
    }

    const channel = interaction.options.getChannel('channel')

    if(!channel.isText()) {
        await interaction.reply({content: t('set_notification_channel.error_channel_type'), ephemeral: true})
        return
    }

    await modifyServer(interaction.guildId, { notification_channel_id: channel.id }, guildExists)

    await interaction.reply({content: t('set_notification_channel.success', {channel: `<#${channel.id}>`}), ephemeral: true})
}

export const disableServerNotificationsHandler = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId, true)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply({content: t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }), ephemeral: true})
        return
    }

    if (guildExists) {
        await db('guilds').where({ guild_id: interaction.guildId }).update({ notification_channel_id: null })
    }

    await interaction.reply({content: t('disable_notification_channel.success'), ephemeral: true})
}

export const modifyTimezoneHandler = async (interaction) => {
    const t = await getGuildTranslation(interaction.guildId)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply({content: t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }), ephemeral: true})
        return
    }

    const timezones = Array.from({length: 25}, (_, i) => i - 12).map(offset => ({value: offset.toString(), label: genUTCString(offset)})) // generate timezones from UTC-12 to UTC+12

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('select_timezone')
                .setPlaceholder(t('timezone_set.placeholder'))
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions(timezones),
        )
    await interaction.reply({content: t('timezone_set.description'), components: [row], ephemeral: true})
}

export const handleSelectTimezone = async (interaction) => {
    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply({content: t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }), ephemeral: true})
        return
    }

    const [t, guildExists] = await getGuildTranslation(interaction.guildId, true)
    const timezone = parseInt(interaction.values[0])
    if (timezone < -12 || timezone > 12) {
        await interaction.reply({content: t('timezone_set.wrong_timezone'), ephemeral: true})
        return
    }
    await modifyServer(interaction.guildId, { timezone }, guildExists)
    await interaction.reply({content: t('timezone_set.success', { timezone: genUTCString(timezone) }), ephemeral: true})
}

export const modifyLanguageHandler = async (interaction) => {
    const t = await getGuildTranslation(interaction.guildId)

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply({content: t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }), ephemeral: true})
        return
    }

    const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('select_language')
                .setPlaceholder(t('language_set.placeholder'))
                .setMaxValues(1)
                .setMinValues(1)
                .addOptions(Object.keys(LANGUAGES).map(lang => ({
                    value: lang,
                    label: getTranslation(lang)('language.name'),
                }))),
        )
    await interaction.reply({content: t('language_set.description'), components: [row], ephemeral: true})
}

export const handleSelectLanguage = async (interaction) => {
    const [t, guildExists] = await getGuildTranslation(interaction.guildId, true)
    const language = interaction.values[0]
    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply({content: t('general.insufficient_permissions', { permissions: 'MANAGE_CHANNELS' }), ephemeral: true})
        return
    }
    if (!Object.keys(LANGUAGES).includes(language)) {
        await interaction.reply({content: t('language_set.doesnt_exist', { language , available_languages: Object.keys(LANGUAGES).join(', ') }), ephemeral: true})
    } else {
        await modifyServer(interaction.guildId, { language }, guildExists)
        await interaction.reply({content: getTranslation(language)('language_set.success', { language }), ephemeral: true})
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
    await fetchNewUsersOnGuild(interaction.guild, memberIds)
    await interaction.reply(t('fix_leaved_user_congratulations.success'))
}