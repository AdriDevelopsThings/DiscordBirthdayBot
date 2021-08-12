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

import { client } from '../bot.js'
import config from '../config.js'
import { inviteHandler, githubHandler, commandsHelpHandler, gettingStartedHandler } from './info.js'
import { setNotificationChannelHandler, modifyTimezoneHandler, modifyLanguageHandler, disableServerNotificationsHandler, fixLeavedUsersCongratulations } from './admin.js'
import { setBirthdayHandler, birthdayHandler, forgetBirthdayHandler } from './birthday_manager.js'
import { addNotificationUserHandler, removeNotificationUserHandler } from './add_notification_user.js'
import { nextBirthdayHandler, currentBirthdayHandler } from './relative_birthday.js'
import { birthdayCalendarHandler } from './birthday_calendar.js'

export const commands = [
    {
        name: 'invite',
        description: 'Get an invite link.',
        handler: inviteHandler,
    },
    {
        name: 'github',
        description: 'Get the link to the github repository.',
        handler: githubHandler,
    },
    {
        name: 'commands',
        description: 'Get an overview of available commands.',
        handler: commandsHelpHandler,
    },
    {
        name: 'getting_started',
        description: 'Get information about important commands',
        handler: gettingStartedHandler,
    },
    {
        name: 'set_notification_channel',
        description: 'Set the notification channel on a guild. (admin)',
        handler: setNotificationChannelHandler,
        options: [{
            name: 'channel',
            description: 'The notification channel.',
            type: 7,
            required: true,
        }],
    },
    {
        name: 'remove_notification_channel',
        description: 'Remove the notification channel and disable all notifications on this guild.',
        handler: disableServerNotificationsHandler,
    },
    {
        name: 'set_birthday',
        description: 'Set birthday.',
        handler: setBirthdayHandler,
        options: [{
            name: 'birthday',
            description: 'Syntax: dd-mm (day-month)',
            type: 3,
            required: true,
        }],
    },
    {
        name: 'birthday',
        description: 'Get your birthday or the birthday of a user.',
        handler: birthdayHandler,
        options: [{
            name: 'user',
            description: 'Get birthday info about user (per default you).',
            type: 6,
            required: false,
        }],
    },
    {
        name: 'forget_birthday',
        description: 'I will forget your birthday.',
        handler: forgetBirthdayHandler,
    },
    {
        name: 'set_timezone',
        description: 'Change the server timezone. (UTC per default)',
        handler: modifyTimezoneHandler,
        options: [{
            name: 'timezone',
            description: 'UTC+-0 or GMT+-0',
            type: 3,
            required: true,
        }],
    },
    {
        name: 'set_language',
        description: 'Change the server language.',
        handler: modifyLanguageHandler,
        options: [{
            name: 'language',
            description: 'Language code (en/de...)',
            type: 3,
            required: true,
        }],
    },
    {
        name: 'enable_notifications',
        description: 'Enable notifications on this server.',
        handler: addNotificationUserHandler,
    },
    {
        name: 'disable_notifications',
        description: 'Disable notifications on this server.',
        handler: removeNotificationUserHandler,
    },
    {
        name: 'fix_leaved_user_congratulations',
        description: 'If a leaved user get congratulated you have to run this command to fix the issue.',
        handler: fixLeavedUsersCongratulations,
    },
    {
        name: 'next_birthday',
        description: 'Show the next date when user has birthday.',
        handler: nextBirthdayHandler,
    },
    {
        name: 'today_birthday',
        description: 'Show users which have birthday today.',
        handler: currentBirthdayHandler,
    },
    {
        name: 'birthday_calendar',
        description: 'Show birthday calendar',
        handler: birthdayCalendarHandler,
        options: [{
            name: 'month',
            description: 'Month',
            type: 3,
            required: false,
        }],
    },
]

export const registerCommands = async () => {
    const guildId = config.environment === 'development' && config.development_guild_id
    const commandList = commands.map(({name, description, options}) => ({name, description, options}))
    if (guildId) {
        client.application.commands.set(commandList, guildId)
    } else {
        client.application.commands.set(commandList)
    }
    
}


export const handleCommand = async (interaction) => {
    for (const command of commands) {
        if (command.name == interaction.commandName) {
            return await command.handler(interaction)
        }
    }

    throw new Error(`Command '${interaction.commandName}' not found.`)
    
}