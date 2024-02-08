const UserRepository = require('../repositories/user')

class UserService {
	constructor(transaction) {
		this.userRepository = new UserRepository(transaction)
	}

	async createUser(payload) {
		return this.userRepository.storeData(payload)
	}

	async getUserById(id, options = {}) {
		const newOptions = this.generateOptions(options)
		return this.userRepository.getBy({ query: { id }, options: newOptions })
	}

	async getUserByEmail(email, options = {}) {
		const newOptions = this.generateOptions(options)
		return this.userRepository.getBy({ query: { email }, options: newOptions })
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