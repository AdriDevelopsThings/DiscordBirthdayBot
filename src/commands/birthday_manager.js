import db from '../db.js'
import { getTranslation } from '../lang.js'

class WrongBirthdaySyntaxError extends Error {}

const doesUserExist = async (user_id) => {
    return (await db('users').where({ user_id }).select('id')).length > 0
}

const parseBirthday = (birthday) => {
    const splitted = birthday.split('-')
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
    const translate = getTranslation()
    const user_id = interaction.user.id
    try {
        const {birthday_day, birthday_month} = parseBirthday(interaction.options.getString('birthday'))
        if (!(await doesUserExist(user_id))) {
            await db('users').insert({ user_id: user_id, birthday_day: birthday_day, birthday_month: birthday_month, created_at: Date.now(), last_modified: Date.now() })
        } else {
            await db('users').where({ user_id }).update({ birthday_day: birthday_day, birthday_month: birthday_month, last_modified: Date.now() })
        }
        if ((await db('notification_users').where({ user_id: user_id, guild_id: interaction.guildId }).select('id')).length == 0) {
            await db('notification_users').insert({ user_id: user_id, guild_id: interaction.guildId })
        }

        await interaction.reply(translate('setbirthday.success'))
    } catch (e) {
        if (e instanceof WrongBirthdaySyntaxError) {
            return await interaction.reply(translate('setbirthday.wrongsyntax'))
        } else {
            throw e
        }
    }
}

export const birthdayHandler = async (interaction) => {
    const translate = getTranslation()
    const targetUserId = interaction.options.getUser('user') || interaction.user.id
    const birthday = await db('users').where({ user_id: targetUserId }).select(['birthday_day', 'birthday_month']).first()
    if (birthday) {
        await interaction.reply(translate('get_birthday_user.success', {day: String(birthday.birthday_day).padStart(2, '0'), month: String(birthday.birthday_month).padStart(2, '0')}))
    } else {
        await interaction.reply(translate('get_birthday_user.doesnt_have_birthday'))
    }
}

export const forgetBirthdayHandler = async (interaction) => {
    await db('users').where({ user_id: interaction.user.id }).del()
    await interaction.reply(getTranslation()('forget_birthday.success'))
}
