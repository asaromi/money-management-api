require('dotenv').config()
const { createClient } = require('redis')
const { REDIS_HOST = 'localhost', REDIS_PORT } = process.env

const redisClient = createClient({
	host: REDIS_HOST,
	port: REDIS_PORT,
})
	.on('error', (error) => {
		console.error(error)
	})
	.on('connect', () => {
		console.log('Redis connected')
	})

module.exports = { redisClient }