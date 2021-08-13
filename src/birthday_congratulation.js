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

import db from './db.js'
import { DateTime } from 'luxon'
import { client } from './bot.js'
import { dateTimeToSQLFormat, genUTCString } from './date_utils.js'
import { getTranslation } from './lang.js'
import { performance } from 'perf_hooks'
import { filterAsync } from './utils.js'

export const fetchNewUsersOnGuild = async (guild, memberIds=null) => {
    console.log(`New guild ${guild.id}`)
    if (memberIds === null) {
        memberIds = (await guild.members.fetch()).map(member => member.id)
    }
    const unfilteredUserIds = (await db('users').whereIn('user_id', memberIds).select('user_id')).map(user => user.user_id)
    const userIds = await filterAsync(unfilteredUserIds,
        async userId => 
            !(await db('notification_users').where({ user_id: userId, guild_id: guild.id }).select().first()))
    if (userIds.length > 0) {
        await db('notification_users').insert(userIds.map(userId => ({ user_id: userId, guild_id: guild.id })))
    }

} 

export const onGuildMemberJoin = async (member) => {
    if (
        await db('users').where({ user_id: member.id }).select().first() &&
        !(await db('notification_users').where({ user_id: member.id, guild_id: member.guild.id }).select().first())) {
            await db('notification_users').insert({ user_id: member.id, guild_id: member.guild.id })
    }
}

export const onGuildMemberLeave = async (member) => {
    await db('notification_users').where({ user_id: member.id, guild_id: member.guild.id }).del()
}

const hasUserBirthdayNow = async (user, guild, translate) => {
    const now = DateTime.now().setZone(genUTCString(guild.timezone))
    if (now.day == user.birthday_day && now.month == user.birthday_month) {
        console.log(`${user.user_id} has birthday!!!`)
        try {   
            await client.channels.cache.get(guild.notification_channel_id).send(translate('birthday.user_has_birthday',{
                mention: `<@${user.user_id}>`,
                day: String(now.day).padStart(2, '0'),
                month: String(now.month).padStart(2, '0'),
                timezone: genUTCString(guild.timezone),
            }))
        } catch (e) {
            console.error(e)
        }
    }
}

export const birthdayCongratulationAlgorythm = async () => {
    const STARTTIME = performance.now()
    const dayPossibilies = [DateTime.now().minus({ day: 1 }), DateTime.now(), DateTime.now().plus({ day: 1 })].map(m => [m.day, m.month])
    const guilds = await db('guilds')
        .whereNotNull('notification_channel_id')
        .where('last_birthday_fetch', '<', dateTimeToSQLFormat(DateTime.now().startOf('day')))
        .orWhere({ last_birthday_fetch: null })
        .select(['guild_id', 'notification_channel_id', 'timezone', 'language'])
    for (const guild of guilds) {
        console.log(`Guild ${guild.guild_id}`)
        await db('guilds').where({ guild_id:  guild.guild_id }).update({ last_birthday_fetch: dateTimeToSQLFormat(DateTime.now().startOf('day'))})
        const translate = getTranslation(guild.language)
        const userIds = (await db('notification_users').where({ guild_id: guild.guild_id }).select('user_id')).map(user => user.user_id)
        const users = []
        for (const userId of userIds) {
            const user = await db('users')
                .where({ user_id: userId })
                .andWhere((builder) => {
                    builder.orWhere({ birthday_day: dayPossibilies[0][0], birthday_month: dayPossibilies[0][1]})
                        .orWhere({ birthday_day: dayPossibilies[1][0], birthday_month: dayPossibilies[1][1]})
                        .orWhere({ birthday_day: dayPossibilies[2][0], birthday_month: dayPossibilies[2][1]})
                })
                .select(['user_id', 'birthday_day', 'birthday_month'])
                .first()
            if (user) {
                users.push(user)
            }
        }
        users.map(user => hasUserBirthdayNow(user, guild, translate))
    }
    
    const ENDTIME = performance.now()
    console.log('birthdayCongratulationAlgorythm finished; took ' + Math.ceil(ENDTIME - STARTTIME) + 'ms!')
    const next_update = 60 * 60 * 1000 - (Date.now() % (60 * 60 * 1000))
    console.log('next update in: ' + Math.floor(next_update / 1000 / 60) + 'm')
    setTimeout(birthdayCongratulationAlgorythm, next_update)
}


