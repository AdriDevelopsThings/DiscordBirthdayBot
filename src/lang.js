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

const LANGUAGES = {en}

const DEFAULT_LANGUAGE = 'en'

export function getTranslation(lang=DEFAULT_LANGUAGE) {
    return function translate(key, options={}) {
        let string = LANGUAGES[lang][key] || LANGUAGES[DEFAULT_LANGUAGE][key]
        for(const [key, values] of Object.entries(options)) {
            string = string.replace(`%${key}%`, values)
        }
        return string
    }
}
