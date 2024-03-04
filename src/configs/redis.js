require('dotenv').config()
const Redis = require('ioredis')
const { REDIS_HOST = 'localhost', REDIS_PORT } = process.env

const redisClient = new Redis({
	host: REDIS_HOST,
	port: REDIS_PORT,
})

redisClient.on('connect', () => {
	console.log('Connected to Redis')
})

module.exports = redisClient