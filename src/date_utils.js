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

import { DateTime } from 'luxon'

export const genUTCString = offset => {
    if(offset < 0) {
        return `UTC${offset}`
    } else if(offset > 0) {
        return `UTC+${offset}`
    } else {
        return 'UTC'
    }
}

export const dateTimeToSQLFormat = (datetime) => datetime.toFormat('yyyy-LL-dd HH:mm:ss')

export const currentDateTimeToSQLFormat = () => dateTimeToSQLFormat(DateTime.now())