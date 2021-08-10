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

export const generateRandomErrorCode = (length=5, charset='1234567890') => {
    let errorCode = DateTime.now().toFormat('dd-LL-yyyy.HH:mm:ss-')
    length += errorCode.length
    while (errorCode.length != length) {
        errorCode += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return errorCode
}
