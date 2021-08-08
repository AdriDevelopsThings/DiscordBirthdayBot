import dotenv from 'dotenv'

dotenv.config()

export default {
    environment: process.env.ENVIRONMENT || 'development',
    development_guild_id: process.env.DEVELOPMENT_GUILD_ID || null,
}