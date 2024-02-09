const UserRepository = require('../repositories/user')
const { redisClient } = require('../configs/redis')
const { debug } = require('../libs/response')

class UserService {
	constructor(transaction) {
		this.userRepository = new UserRepository(transaction)
	}

	async countUsers({ query }) {
		return this.userRepository.countBy({ query })
	}

	async createUser(payload) {
		return this.userRepository.storeData(payload)
	}

	async getUserById(id, options = {}) {
		const newOptions = this.generateOptions(options)

		const redisKey = `users:U-${id}`
		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const user = await this.userRepository.getBy({ query: { id }, options: newOptions })
		redisClient.set(redisKey, JSON.stringify(user), { 'EX': 300 })
		return user
	}

	async getUserByEmail(email, options = {}) {
		const newOptions = this.generateOptions(options)

		const redisKey = `users:E-${email}`
		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const user = await this.userRepository.getBy({ query: { email }, options: newOptions })
		redisClient.set(redisKey, JSON.stringify(user), { 'EX': 300 })
		return user
	}

	async updateUserBy({ query, data }) {
		return await this.userRepository.updateBy({ query, data })
	}

	async updateUserById(id, data) {
		return await this.updateUserBy({ query: { id }, data })
	}

	generateOptions(options = {}) {
		const { isLogin, attributes = {}, ...newOptions } = options
		if (Array.isArray(attributes)) {
			newOptions.attributes = {
				include: attributes,
				exclude: ['password', 'deletedAt'],
			}
		} else {
			attributes.exclude = [...new Set([...attributes.exclude || [], 'password'])]
			newOptions.attributes = attributes
		}

		if (isLogin) {
			newOptions.attributes.exclude = attributes.exclude.filter((attribute) => attribute !== 'password')
		}

		return newOptions
	}
	
	setTransaction(transaction) {
		this.userRepository.transaction = transaction
	}
}

module.exports = UserService