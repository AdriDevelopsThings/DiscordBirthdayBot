export async function up (knex) {
    await knex.schema.createTable('guilds', table => {
        table.increments('id')
        table.bigInteger('guild_id').notNullable().unique()
        table.bigInteger('notification_channel_id')
        table.string('language', 3).notNullable().defaultTo('en')

        table.integer('timezone').notNullable().defaultTo(0)

        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('last_birthday_fetch')
        table.timestamp('last_modified').defaultTo(knex.fn.now())
    })
    
    await knex.schema.createTable('users', table => {
        table.increments('id')
        table.bigInteger('user_id').notNullable().unique()
        table.integer('birthday_day')
        table.integer('birthday_month')
        table.integer('last_birthday_year')

        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('last_modified').defaultTo(knex.fn.now())
    })

    await knex.schema.createTable('notification_users', table => {
        table.increments('id')
        table.bigInteger('user_id').notNullable()
        table.bigInteger('guild_id').notNullable()
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
