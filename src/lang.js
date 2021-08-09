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
import { readFile } from 'fs/promises'
import path from 'path'

export const LANGUAGES = {}

const DEFAULT_LANGUAGE = 'en'

export const getTranslation = (lang=DEFAULT_LANGUAGE) => {
    return function translate(key, options={}) {
        let string = (LANGUAGES[lang] && LANGUAGES[lang][key]) ||
            (LANGUAGES[DEFAULT_LANGUAGE] && LANGUAGES[DEFAULT_LANGUAGE][key]) || key
        for(const [key, values] of Object.entries(options)) {
            string = string.replace(`%${key}%`, values)
        }
        return string
    }
}

const __dirname = process.cwd()
const localesPath = path.join(__dirname, path.sep, 'locales')

const loadLanguageFile = async (lang) => {
    const json = await readFile(path.join(localesPath, path.sep, lang + '.json'))
    LANGUAGES[lang] = JSON.parse(json)
}

export const loadAllLangs = async () => {
    const locales = (await readFile(path.join(localesPath, path.sep, 'index.json'), 'utf8')).toString()
    const localesList = JSON.parse(locales)
    const promises = localesList.map(locale => loadLanguageFile(locale))
    await Promise.all(promises)
}

export const getGuildTranslation = async (guildId, returnGuildExist=false) => {
    const langRow = await db('guilds').where({ guild_id: guildId }).select('language').first()
    const guildExists = !!langRow
    const lang = guildExists ? langRow.language : DEFAULT_LANGUAGE

    if (returnGuildExist) {
        return [getTranslation(lang), guildExists]
    } else {
        return getTranslation(lang)
    }
}
