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

import { currentDateTimeToSQLFormat } from '../date_utils.js'
import db from '../db.js'
import { getGuildTranslation } from '../lang.js'

class WrongBirthdaySyntaxError extends Error {}

const doesUserExist = async (user_id) => {
    return (await db('users').where({ user_id }).select('id')).length > 0
}

const parseBirthday = (birthday) => {
    const splitted = birthday.replaceAll('.', '-').split('-').filter(s => s)
    if (splitted.length != 2) {
        throw new WrongBirthdaySyntaxError()
    }
    const birthday_day = parseInt(splitted[0])
    const birthday_month = parseInt(splitted[1])

    if (birthday_day < 1 || birthday_day > 31 || birthday_month < 1 || birthday_month > 12) {
        throw new WrongBirthdaySyntaxError()
    }

    return { birthday_day, birthday_month }
}

export const setBirthdayHandler = async (interaction) => {
    const translate = await getGuildTranslation(interaction.guildId)
    const user_id = interaction.user.id
    try {
        const {birthday_day, birthday_month} = parseBirthday(interaction.options.getString('birthday'))
        if (!(await doesUserExist(user_id))) {
            await db('users').insert({ user_id, birthday_day, birthday_month, created_at: currentDateTimeToSQLFormat(), last_modified: currentDateTimeToSQLFormat() })
        } else {
            await db('users').where({ user_id }).update({ birthday_day, birthday_month, last_modified: currentDateTimeToSQLFormat() })
        }
        if ((await db('notification_users').where({ user_id, guild_id: interaction.guildId }).select('id')).length == 0) {
            await db('notification_users').insert({ user_id, guild_id: interaction.guildId })
        }

        await interaction.reply(translate('set_birthday.success'))
    } catch (e) {
        if (e instanceof WrongBirthdaySyntaxError) {
            return await interaction.reply(translate('set_birthday.wrong_syntax'))
        } else {
            throw e
        }
    }
}

export const birthdayHandler = async (interaction) => {
    const translate = await getGuildTranslation(interaction.guildId)
    const targetUserId = interaction.options.getUser('user') || interaction.user.id
    const birthday = await db('users').where({ user_id: targetUserId }).select(['birthday_day', 'birthday_month']).first()
    if (birthday) {
        const birthdayTranslationData = {day: String(birthday.birthday_day).padStart(2, '0'), month: String(birthday.birthday_month).padStart(2, '0')}
        if (targetUserId == interaction.user.id) {
            await interaction.reply(translate('get_birthday_user.you.success', birthdayTranslationData))
        } else {
            await interaction.reply(translate('get_birthday_user.success', birthdayTranslationData))            
        }
    } else {
        if (targetUserId == interaction.user.id) {
            await interaction.reply(translate('get_birthday_user.you.no_birthday'))
        } else {
            await interaction.reply(translate('get_birthday_user.no_birthday'))
        }
    }
}

export const forgetBirthdayHandler = async (interaction) => {
    await db('users').where({ user_id: interaction.user.id }).del()
    await interaction.reply((await getGuildTranslation(interaction.guildId))('forget_birthday.success'))
}
