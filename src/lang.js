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

import en from '../locales/en.js'
import de from '../locales/de.js'

import db from './db.js'

export const LANGUAGES = {en,de}

const DEFAULT_LANGUAGE = 'en'

export const getTranslation = (lang=DEFAULT_LANGUAGE) => {
    return function translate(key, options={}) {
        let string = LANGUAGES[lang][key] || LANGUAGES[DEFAULT_LANGUAGE][key] || key
        for(const [key, values] of Object.entries(options)) {
            string = string.replace(`%${key}%`, values)
        }
        return string
    }
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