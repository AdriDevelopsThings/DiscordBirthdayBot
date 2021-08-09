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

import db from '../db.js'
import { getGuildTranslation } from '../lang.js'

const modifyNotification = async (userId, guildId, state) => {
    const user = await db('users').where({ user_id: userId })
        .whereNotNull('birthday_day')
        .whereNotNull('birthday_month')
        .select(['birthday_day', 'birthday_month'])
        .first()
    if (state) {
        if (!(await db('notification_users').where({ user_id: userId, guild_id: guildId }).first())) {
            await db('notification_users').insert({ user_id: userId, guild_id: guildId })
        }
    } else {
        await db('notification_users').where({ user_id: userId, guild_id: guildId }).del()
    }
    return Boolean(user)
}

export const addNotificationUserHandler = async (interaction) => {
    const t = await getGuildTranslation(interaction.guildId)
    const userId = interaction.user.id
    const guildId = interaction.guild.id
    const result = await modifyNotification(userId, guildId, true)
    await interaction.reply(result ? t('add_notification_user.success') : t('add_notification_user.no_birthday'))
}

export const removeNotificationUserHandler = async (interaction) => {
    const t = await getGuildTranslation(interaction.guildId)
    const userId = interaction.user.id
    const guildId = interaction.guild.id
    await modifyNotification(userId, guildId, false)
    await interaction.reply(t('remove_notification_user.success'))
}