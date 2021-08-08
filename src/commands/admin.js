import knex from '../db.js'
import { getTranslation } from '../lang.js'

export const setNotificationChannelHandler = async (interaction) => {
    const t = getTranslation()

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions'))
        return
    }

    const channel = interaction.options.getChannel('channel')

    if(!channel.isText()) {
        await interaction.reply(t('admin.set_notification_channel.error_channel_type'))
        return
    }

    const guildExists = (await knex('guilds')
        .select('id')
        .where({guild_id: interaction.guildId}))
        .length !== 0

    if(!guildExists) {
        await knex('guilds')
            .insert({
                guild_id: interaction.guildId,
                last_modified: Date.now(),
                created_at: Date.now(),
                notification_channel_id: channel.id,
                timezone: 0,
            })
    } else {
        await knex('guilds')
            .where({guild_id: interaction.guildId})
            .update({
                last_modified: Date.now(),
                notification_channel_id: channel.id,
            })
    }

    await interaction.reply(t('admin.set_notification_channel.success', {channel: `<#${channel.id}>`}))
}

export const modifyTimezoneHandler = async (interaction) => {
    const t = getTranslation()

    if(!interaction.member.permissions.has('MANAGE_CHANNELS')) {
        await interaction.reply(t('general.insufficient_permissions'))
        return
    }

    let timezoneString = interaction.options.getString('timezone').toLowerCase().replace('gmt', 'utc')
    if (timezoneString == 'utc' || timezoneString == 'utc0') {
        timezoneString = 'utc+0'
    }

    if (timezoneString.length != 5) {
        await interaction.reply(t('timezone_set.wrong_syntax'))
    }

    const timezone = parseInt(timezoneString.substr(3))
    if (timezone < -12 || timezone > 12) {
        await interaction.reply(t('timezone_set.wrong_syntax'))
    }
    
    const guildExists = (await knex('guilds')
        .select('id')
        .where({guild_id: interaction.guildId}))
        .length !== 0

    if(!guildExists) {
        await knex('guilds')
            .insert({
                guild_id: interaction.guildId,
                last_modified: Date.now(),
                created_at: Date.now(),
                timezone,
            })
    } else {
        await knex('guilds')
            .where({guild_id: interaction.guildId})
            .update({
                last_modified: Date.now(),
                timezone,
            })
    }

    await interaction.reply(t('timezone_set.success'))

}
