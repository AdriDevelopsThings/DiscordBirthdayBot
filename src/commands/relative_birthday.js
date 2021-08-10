import db from '../db.js'
import { DateTime } from 'luxon'
import { genUTCString } from '../date_utils.js'
import { getGuildTranslation } from '../lang.js'

export const nextBirthdayHandler = async interaction => {
    const guildId = interaction.guild.id
    const translate = await getGuildTranslation(interaction.guild.id)
    const guildUserIds = (await db('notification_users').where({ guild_id: guildId }).select('user_id')).map(user => user.user_id)
    const timezone = ((await db('guilds')
        .where({ guild_id: guildId })
        .select('timezone').first()) || { timezone: 0 }).timezone
    const users = await db('users')
        .whereIn('user_id', guildUserIds)
        .whereNotNull('birthday_day')
        .whereNotNull('birthday_month')
        .select(['user_id', 'birthday_day', 'birthday_month'])
    const now = DateTime.now().setZone(genUTCString(timezone))
    const userDates = users.map(user => 
        ({ user_id: user.user_id, date: DateTime.fromObject({ day: user.birthday_day, month: user.birthday_month }).setZone(genUTCString(timezone)) }))
        .map(user => ({ ...user, date: (user.date.day > now.day && user.date.month == now.month ) || user.date.month > now.month ? user.date : user.date.plus({ year: 1 }) }))
        .map(user => ({ ...user, date: user.date }))
    userDates.sort((a, b) => a.date.toMillis() - b.date.toMillis())
    const nextDates = []
    for (const user of userDates) {
        if (nextDates.length == 0 || nextDates[nextDates.length - 1].date == user.date) {
            nextDates.push(user)
        } else {
            break
        }
    }

    if (nextDates.length == 0) {
        await interaction.reply(translate('next_birthday.nobody'))

    } else if (nextDates.length == 1) {
        await interaction.reply(translate('next_birthday.one_user', {
            day: String(nextDates[0].date.day).padStart(2, '0'),
            month: String(nextDates[0].date.month).padStart(2, '0'),
            mention: `<@${nextDates[0].user_id}>`,
            relative: `<t:${Math.floor(nextDates[0].date.toSeconds())}:R>`,
        }))
    } else {
        await interaction.reply(translate('next_birthday.multiple_users', {
            day: String(nextDates[0].date.day).padStart(2, '0'),
            month: String(nextDates[0].date.month).padStart(2, '0'),
            mentions: nextDates.map(user => `<@${user.user_id}>`).join(', '),
            relative: `<t:${Math.floor(nextDates[0].date.toSeconds())}:R>`,
        }))
    }

}

export const currentBirthdayHandler = async interaction => {
    const guildId = interaction.guild.id
    const translate = await getGuildTranslation(interaction.guild.id)
    const guildUserIds = (await db('notification_users').where({ guild_id: guildId }).select('user_id')).map(user => user.user_id)
    const timezone = ((await db('guilds')
        .where({ guild_id: guildId })
        .select('timezone').first()) || { timezone: 0 }).timezone
    const now = DateTime.now().setZone(genUTCString(timezone))
    const users = (await db('users')
        .whereIn('user_id', guildUserIds)
        .where({ birthday_day: now.day, birthday_month: now.month })
        .select(['user_id'])).map(user => user.user_id)
    if (users.length == 0) {
        await interaction.reply(translate('current_birthday.nobody'))
    } else if (users.length == 1) {
        await interaction.reply(translate('current_birthday.one_user', { mention: `<@${users[0]}>` }))
    } else {
        await interaction.reply(translate('current_birthday.multiple_users', {
            mentions: users.map(user_id => `<@${user_id}>`).join(', '),
        }))
    }

}