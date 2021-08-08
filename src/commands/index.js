import { client } from '../bot.js'
import config from '../config.js'
import { inviteHandler, githubHandler } from './info.js'
import { setNotificationChannelHandler, modifyTimezoneHandler } from './admin.js'
import { setBirthdayHandler, birthdayHandler, forgetBirthdayHandler } from './birthday_manager.js'

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
        name: 'set_birthday',
        description: 'Set birthday.',
        handler: setBirthdayHandler,
        options: [{
            name: 'birthday',
            description: 'dd-mm',
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
        name: 'change_timezone',
        description: 'Change your timezone. (UTC per default)',
        handler: modifyTimezoneHandler,
        options: [{
            name: 'timezone',
            description: 'UTC+-0 or GMT+-0',
            type: 3,
            required: true,
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
            return command.handler(interaction)
        }
    }

    throw new Error(`Command '${interaction.commandName}' not found.`)
    
}