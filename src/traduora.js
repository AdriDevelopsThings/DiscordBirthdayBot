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

import fetch from 'node-fetch'
import config from './config.js'
import { createWriteStream, existsSync } from 'fs'
import { writeFile, mkdir } from 'fs/promises'
import { join, sep } from 'path'

const localesPath = join(process.cwd(), sep, 'locales')

class Traduora {
    constructor (client_id, client_secret) {
        this.client_id = client_id
        this.client_secret = client_secret
        this.bearer_token = null
    }

    async getBearerToken () {
        if (!this.bearer_token) {
            await this.makeBearerToken()
        }
        return this.bearer_token
    }

    async makeBearerToken () {
        const response = await fetch(config.traduora_api_url + '/auth/token', {
                method: 'POST',
                body: JSON.stringify({
                    grant_type: 'client_credentials',
                    client_id: config.traduora_api_client_id,
                    client_secret: config.traduora_api_client_secret,
                }),
                headers: { 'Content-Type': 'application/json' },
            })
        const json = await response.json()
        this.bearer_token = json.access_token
    }

    async getAuthenticationData () {
        return { headers: { 'Authorization': `Bearer ${await this.getBearerToken()}` } }
    }

    async getAvailableLocales () {
        const response = await fetch(config.traduora_api_url + `/projects/${config.traduora_api_project_id}/translations`, await this.getAuthenticationData())
        const json = await response.json()
        return json.data.map(data => data.locale.code)
    }

    async downloadLocale (locale) {
        const response = await fetch(config.traduora_api_url + `/projects/${config.traduora_api_project_id}/exports?locale=${locale}&format=jsonflat`, await this.getAuthenticationData())
        const stream = createWriteStream(join(localesPath, sep, locale + '.json'))
        await new Promise((resolve, reject) => {
            response.body.pipe(stream)
            response.body.on('error', reject)
            response.body.on('finish', resolve)
        })
    }


}

export const downloadNewLocales = async () => {
    if (!config.traduora_api_url || !config.traduora_api_project_id || !config.traduora_api_client_id || !config.traduora_api_client_secret) {
        throw new Error('You have to set the following environment variables: TRADUORA_API_CLIENT_ID, TRADUORA_API_CLIENT_SECRET, TRADUORA_API_PROJECT_ID!')
    }

    if (!existsSync(localesPath)) {
        await mkdir(localesPath)
    }    

    const traduora = new Traduora(config.traduora_api_project_id, config.traduora_api_client_secret)
    const availableLanguages = await traduora.getAvailableLocales()
    await writeFile(join(localesPath, sep, 'index.json'), JSON.stringify(availableLanguages))
    for (const language of availableLanguages) {
        console.log(`Download ${language}.json`)
        traduora.downloadLocale(language)
    }
}