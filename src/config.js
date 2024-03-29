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

import dotenv from 'dotenv'

dotenv.config()

export default {
    environment: process.env.ENVIRONMENT || 'development',
    development_guild_id: process.env.DEVELOPMENT_GUILD_ID || null,
    traduora_api_url: process.env.TRADUORA_API_URL || 'https://traduora.adridoesthings.com/api/v1',
    traduora_api_client_id: process.env.TRADUORA_API_CLIENT_ID,
    traduora_api_client_secret: process.env.TRADUORA_API_CLIENT_SECRET,
    traduora_api_project_id: process.env.TRADUORA_API_PROJECT_ID,
    top_gg_token: process.env.TOP_GG_TOKEN,
}