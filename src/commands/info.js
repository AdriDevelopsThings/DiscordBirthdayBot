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

import { getGuildTranslation } from '../lang.js'
import { MessageActionRow, MessageButton } from 'discord.js'
import { GITHUB_URL, INVITE_URL, COMMAND_OVERVIEW } from '../consts.js'

export const inviteHandler = async (interaction) => {
    const translate = await getGuildTranslation(interaction.guildId)
    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setLabel(translate('invite.button_text'))
            .setStyle('LINK')
            .setURL(INVITE_URL))
    await interaction.reply({ content: translate('invite.text'), components: [row] })
}

export const githubHandler = async (interaction) => {
    const translate = await getGuildTranslation(interaction.guildId)
    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setLabel(translate('github.button_text'))
            .setStyle('LINK')
            .setURL(GITHUB_URL))
    await interaction.reply({ content: translate('github.text'), components: [row] })
}

export const commandsHelpHandler = async (interaction) => {
    const translate = await getGuildTranslation(interaction.guildId)
    const row = new MessageActionRow().addComponents(
        new MessageButton()
            .setLabel(translate('commands.button_text'))
            .setStyle('LINK')
            .setURL(COMMAND_OVERVIEW))
    await interaction.reply({ content: translate('commands.text'), components: [row] })
}

export const gettingStartedHandler = async interaction => {
    const translate = await getGuildTranslation(interaction.guildId)

    const embeds = [{
        title: translate('getting_started.title'),
        description: translate('getting_started.description'),
        color: 16743579,
        fields: [
            {
                name: translate('getting_started.set_birthday.title'),
                value: translate('getting_started.set_birthday.text'),
            },
            {
                name: translate('getting_started.birthday.title'),
                value: translate('getting_started.birthday.text'),
            },
            {
                name: translate('getting_started.birthday_calendar.title'),
                value: translate('getting_started.birthday_calendar.text'),
            },
            {
                name: translate('getting_started.more_commands'),
                value: COMMAND_OVERVIEW,
            },
        ],
    }]

    if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
        embeds.push({
            title: translate('getting_started.admin.title'),
            description: translate('getting_started.admin.description'),
            color: 16743579,
            fields: [{
                name: translate('getting_started.admin.link_title'),
                value: INVITE_URL,
            }],
        })
    }

    await interaction.reply({ embeds })
}
