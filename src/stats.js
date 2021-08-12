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

import { client } from './bot.js'
import { currentDateTimeToSQLFormat } from './date_utils.js'
import db from './db.js'

export const runFetchStats = async () => {
    const guildsCount = client.guilds.cache.size
    const configuredGuildCount = (await db('guilds').count())[0]['count(*)']
    const guildsWithNotificationEnabledCount = (await db('guilds').whereNotNull('notification_channel_id').count())[0]['count(*)']
    const usersCount = (await db('users').count())[0]['count(*)']

    await db('stats').insert({
        guilds: guildsCount,
        configured_guilds: configuredGuildCount,
        guilds_with_notification_enabled: guildsWithNotificationEnabledCount,
        users: usersCount,
        timestamp: currentDateTimeToSQLFormat(),
    })

    await client.user.setPresence({
        status: 'online',
        activities: [{ name: `on ${guildsCount} servers with ${usersCount} users`, type: 0 }],
    })

    setTimeout(runFetchStats, 1000 * 60 * 15)
}