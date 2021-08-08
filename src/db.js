import knex from 'knex'
import knexfile from '../knexfile.js'
import config from './config.js'

export default knex(knexfile[config.environment])
