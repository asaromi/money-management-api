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

	async getUserBy({ query, options }) {
		let redisKey = 'users'
		if (query.email) redisKey += `:E-${query.email}`
		if (query.id) redisKey += `:U-${query.id}`

		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const newOptions = this.generateOptions(options)
		const user = await this.userRepository.getBy({ query, options: newOptions })
		if (user) {
			await redisClient.set(redisKey, JSON.stringify(user), { 'EX': 300 })
		}

		return user
	}

	async getUserById(id, options = {}) {
		return await this.getUserBy({ query: { id }, options })
	}

	async getUserByEmail(email, options = {}) {
		return await this.getUserBy({ query: { email }, options })
	}

	async updateUserBy({ query, data }) {
		let redisKey = 'users'
		if (query.email) redisKey += `:E-${query.email}`
		if (query.id) redisKey += `:U-${query.id}`

		const cached = await redisClient.get(redisKey)
		if (cached) {
			await redisClient.del(redisKey)
		}

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