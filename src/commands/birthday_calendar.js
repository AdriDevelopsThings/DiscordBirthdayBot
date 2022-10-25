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

import discordjs from 'discord.js'
import { DateTime } from 'luxon'
import { EMOJIS } from '../consts.js'
import db from '../db.js'
import { getGuildTranslation } from '../lang.js'

const calendarViews = []

class CalendarView {
    constructor (translate, guildId, message, authorUserId, month) {
        this.translate = translate
        this.guildId = guildId
        this.message = message
        this.authorUserId = authorUserId
        this.month = month
    }

    async regenerate () {
        const [ embed1, embed2 ] = await generateEmbed(this.translate, this.guildId, this.month)
        await this.message.edit({ embeds: [ embed1, embed2 ] })
    }

    async increaseMonth () {
        if (this.month == 12) {
            this.month = 1
        } else {
            this.month += 1
        }        
        await this.regenerate()
    }

    async decreaseMonth () {
        if (this.month == 1) {
            this.month = 12
        } else {
            this.month -= 1
        }
        await this.regenerate()
    }

    async remove () {
        await this.message.delete()
        calendarViews.splice(calendarViews.indexOf(this), 1)
    }
}

const generateEmbed = async (translate, guildId, month) => {
    const userIds = (await db('notification_users').where({ guild_id: guildId }).select('user_id')).map(user => user.user_id)
    const users = await db('users')
        .whereIn('user_id', userIds)
        .whereNotNull('birthday_day')
        .where({ birthday_month: month })
        .select(['user_id', 'birthday_day', 'birthday_month'])
    const embed1 = new discordjs.EmbedBuilder().setTitle(translate('birthday_calendar.embed_name', { month: String(month).padStart(2, '0') }))
    const embed2 = new discordjs.EmbedBuilder().setTitle(translate('birthday_calendar.embed_name', { month: String(month).padStart(2, '0') }))

    for (let i=1; i <= 31; i++) {
        const usersAtThisDay = users.filter(user => i == user.birthday_day).map(user => `<@${user.user_id}>`).join(', ') || '-'
        if (i < 16) {
            embed1.addFields(String(i), usersAtThisDay, true)
        } else {
            embed2.addFields(String(i), usersAtThisDay, true)
        }
    }
    return [embed1, embed2]
}

export const birthdayCalendarHandler = async (interaction) => {
    const guildId = interaction.guild.id
    const translate = await getGuildTranslation(guildId)
    let month = interaction.options.getString('month') || String(DateTime.now().month)
    try {
        month = parseInt(month)
        if (month < 1 || month > 12) {
            throw Error('Wrong int')
        }
    } catch {
        month = DateTime.now().month
    }

    const [ embed1, embed2 ] = await generateEmbed(translate, guildId, month)
    const message = await interaction.reply({ embeds: [ embed1, embed2 ], fetchReply: true})
    await message.react(EMOJIS.arrow_backward)
    await message.react(EMOJIS.wastebasket)
    await message.react(EMOJIS.arrow_forward)

    calendarViews.push(new CalendarView(translate, guildId, message, interaction.user.id, month))
}

export const onMessageReactionAddBirthdayCalendar = async (reaction, user) => {
    if (user.me) { return }
    const views = calendarViews.filter(view => view.message.id == reaction.message.id)
    if (views.length > 0) {
        const view = views[0]
        if (view.authorUserId != user.id) {
            return
        }
        switch(reaction.emoji.toString()) {
            case EMOJIS.arrow_forward:
                await view.increaseMonth()
                break
            case EMOJIS.arrow_backward:
                await view.decreaseMonth()
                break
            case EMOJIS.wastebasket:
                await view.remove()
                break
        }
        if (reaction.emoji.toString() != EMOJIS.wastebasket) {
            await reaction.users.remove(user.id)
        }
    }
}