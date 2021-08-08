export default {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3',
    },
  },

  production: {
    client: 'mysql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

}
