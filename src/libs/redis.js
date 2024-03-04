const redisClient = require('../configs/redis')
const { InvariantError } = require('./exceptions')

exports.setCache = async (key, value, expiration = 300) => {
	if (!key || !value) throw new InvariantError('Key and value are required')

	await redisClient.set(key, JSON.stringify(value))
	await redisClient.expire(key, expiration)
}

exports.getCache = async (key) => {
	const cached = await redisClient.get(key)
	if (!cached) return null

	return JSON.parse(cached)
}

exports.destroyCache = async (key) => {
	await redisClient.del(key)
}

exports.isCacheConnected = redisClient.options.enableReadyCheck && redisClient.status === 'ready'