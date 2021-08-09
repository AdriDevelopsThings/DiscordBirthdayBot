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

export async function up (knex) {
    await knex.schema.createTable('guilds', table => {
        table.increments('id')
        table.string('guild_id', 20).notNullable().unique()
        table.string('notification_channel_id', 20)
        table.string('language', 3).notNullable().defaultTo('en')

        table.integer('timezone').notNullable().defaultTo(0)

        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('last_birthday_fetch')
        table.timestamp('last_modified').defaultTo(knex.fn.now())
    })
    
    await knex.schema.createTable('users', table => {
        table.increments('id')
        table.string('user_id', 20).notNullable().unique()
        table.integer('birthday_day')
        table.integer('birthday_month')

        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('last_modified').defaultTo(knex.fn.now())
    })

    await knex.schema.createTable('notification_users', table => {
        table.increments('id')
        table.string('user_id', 20).notNullable()
        table.string('guild_id', 20).notNullable()
    })

    await knex.schema.createTable('stats', table => {
        table.increments('id')
        table.integer('guild').notNullable()
        table.integer('configured_guilds').notNullable()
        table.integer('users').notNullable()

        table.timestamp('timestamp').defaultTo(knex.fn.now())
    })
}

export async function down(knex) {
    await knex.schema.dropTable('guilds')
    await knex.schema.dropTable('users')
    await knex.schema.dropTable('stats')
    await knex.schema.dropTable('notification_users')
}
