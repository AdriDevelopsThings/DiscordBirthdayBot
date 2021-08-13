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
import { setNotificationChannelHandler, modifyTimezoneHandler, modifyLanguageHandler, disableServerNotificationsHandler, fixLeavedUsersCongratulations, handleSelectTimezone, handleSelectLanguage } from './admin.js'
import { setBirthdayHandler, birthdayHandler, forgetBirthdayHandler } from './birthday_manager.js'
import { addNotificationUserHandler, removeNotificationUserHandler } from './add_notification_user.js'
import { nextBirthdayHandler, currentBirthdayHandler } from './relative_birthday.js'
import { birthdayCalendarHandler } from './birthday_calendar.js'

export const commands = [
    /* Info commands */
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
    /* Admin commands */
    {
        name: 'settings',
        description: 'Server settings for admins',
        options: [
            {
                name: 'help',
                description: 'Admin help command',
                type: 1,
                handler: inviteHandler,
            },
            {
                name: 'notification_channel',
                description: 'Manage the notification channel',
                type: 2,
                options: [
                    {
                        name: 'set',
                        description: 'Set the notification channel to a new one',
                        type: 1,
                        handler: setNotificationChannelHandler,
                        options: [{
                            name: 'channel',
                            description: 'The notification channel.',
                            type: 7,
                            required: true,
                        }],
                    },
                    {
                        name: 'remove',
                        description: 'Remove the notification channel and disable all notifications on this guild',
                        type: 1,
                        handler: disableServerNotificationsHandler,
                    },
                ],
            },
            {
                name: 'language',
                description: 'Set your server language',
                type: 1,
                handler: modifyLanguageHandler,
                select_menu_handlers: {
                    select_language: handleSelectLanguage,
                },
            },
            {
                name: 'timezone',
                description: 'Change the server timezone. (UTC per default)',
                type: 1,
                handler: modifyTimezoneHandler,
                select_menu_handlers: {
                    select_timezone: handleSelectTimezone,
                },

            },
            {
                name: 'fix_leaved_user_congratulations',
                description: 'If a leaved user get congratulated you have to run this command to fix the issue',
                type: 1,
                handler: fixLeavedUsersCongratulations,
            },
        ],
    },
    /* User commands */
    /* Birthday command */
    {
        name: 'birthday',
        description: 'Manage or see birthdays',
        options: [
            {
                name: 'query',
                description: 'Get your birthday or the birthday of a user',
                type: 1,
                handler: birthdayHandler,
                options: [{
                    name: 'user',
                    description: 'Get birthday info about user (per default you).',
                    type: 6,
                    required: false,
                }],
            },
            {
                name: 'set',
                description: 'Set your birthday',
                type: 1,
                handler: setBirthdayHandler,
                options: [{
                    name: 'birthday',
                    description: 'Syntax: dd-mm (day-month)',
                    type: 3,
                    required: true,
                }],
            },
            {
                name: 'calendar',
                description: 'Show birthday calendar',
                type: 1,
                handler: birthdayCalendarHandler,
                options: [{
                    name: 'month',
                    description: 'Month',
                    type: 3,
                    required: false,
                }],
            },
            {
                name: 'next',
                description: 'Show the next date when user has birthday',
                type: 1,
                handler: nextBirthdayHandler,
            },
            {
                name: 'today',
                description: 'Show users which have birthday today',
                type: 1,
                handler: currentBirthdayHandler,
            },
            {
                name: 'forget',
                description: 'I will forget your birthday',
                type: 1,
                handler: forgetBirthdayHandler,
            },
        ],
    },
    /* Notification manager */
    {
        name: 'notifications',
        description: 'Disable and re-enable notifications on this server',
        options: [
            {
                name: 'disable',
                description: 'Disable notifications on this server',
                type: 1,
                handler: removeNotificationUserHandler,
            },
            {
                name: 'enable',
                description: 'Re-Enable notifications on this server',
                type: 1,
                handler: addNotificationUserHandler,
            },
        ],
    },
]

const buildCommandObjectList = (commandList=commands) => {
    commandList = commandList.map(({name, description, options}) => ({name, description, options}))
    return commandList.map(command => {        
        if (command.options && command.options.filter(option => option.type == 1 || option.type == 2).length == 0) {
            command.options = buildCommandObjectList(command.options)
            return command
        } else {
            return command
        }
    })
}

export const registerCommands = async () => {
    const guildId = config.environment === 'development' && config.development_guild_id
    const commandList = buildCommandObjectList()
    if (guildId) {
        client.application.commands.set(commandList, guildId)
    } else {
        client.application.commands.set(commandList)
    }
    
}

const forEachCommand = (filterBuilder, forEachCommands=commands, root='') => {
    for (const command of forEachCommands) {
        const currentRoot = root + (root ? '.' : '') + command.name
        if (filterBuilder({ command, root: currentRoot }) && (!command.type || command.type == 1)) {
            return command
        } else if (command.options && command.options.filter(option => option.type == 1 || option.type == 2).length > 0) {
            const returnCommand = forEachCommand(filterBuilder, command.options, currentRoot)
            if (returnCommand) {
                return returnCommand
            }
        }
    }
    if (root === '') {
        throw new Error(`Command '${filterBuilder}' not found.`)   
    } else {
        return null
    }
}

const getRootOfInteraction = (commandName, interactionOptions) => {
    let root = ''
    const group = interactionOptions.getSubcommandGroup(false)
    if (group) {
        root += group + '.'
    }
    const subCommand = interactionOptions.getSubcommand(false)
    if (subCommand) {
        root += subCommand
    }
    return commandName + (root ? '.' + root : '')
}

export const handleCommand = async (interaction) => {
    const interactionRoot = getRootOfInteraction(interaction.commandName, interaction.options)
    await forEachCommand(({ command, root }) => command.handler && root == interactionRoot).handler(interaction)
}

export const handleSelectMenu = async (interaction)=> {
    await forEachCommand(({ command }) => command.select_menu_handlers && command.select_menu_handlers[interaction.customId]).select_menu_handlers[interaction.customId](interaction)
}