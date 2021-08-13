import { client } from '../bot.js'
import config from '../config.js'
import { createHash } from 'crypto'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

const __dirname = process.cwd()

const command_hashs_path = path.join(__dirname, path.sep, 'command_hashs.save')

const pushCommandList = async (commandList, guildId, callback) => {
    const commandListHash = createHash('md5').update(JSON.stringify(commandList)).digest('hex')
    let guildIdHash = ''
    if (guildId) {
        guildIdHash = createHash('md5').update(guildId).digest('hex')
    }
    const fsHash = commandListHash + ':' + guildIdHash
    if (!existsSync(command_hashs_path) || await readFile(command_hashs_path) != fsHash) {
        await callback()
        console.log(`New commands with hash ${fsHash}`)
        await writeFile(command_hashs_path, fsHash)
    }
}

export const registerCommandsIfNew = async (commandList) => {
    const guildId = config.environment === 'development' && config.development_guild_id
    pushCommandList(commandList, guildId, () => {
        if (guildId) {
            client.application.commands.set(commandList, guildId)
        } else {
            client.application.commands.set(commandList)
        }
    })
}