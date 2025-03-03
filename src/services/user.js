const UserRepository = require('../repositories/user')
const { InvariantError } = require('../libs/exceptions')

class UserService {
	constructor(transaction) {
		this.userRepository = new UserRepository(transaction)
	}

	async countUsers({ query }) {
		return this.userRepository.countBy({ query })
	}

	async createUser(payload) {
		const user = await this.userRepository.storeData(payload)
		if (!user) throw new InvariantError('Failed to create user')

		return user
	}

	async deleteUserBy({ query }) {
		return await this.userRepository.deleteBy({ query })
	}

	async getUserBy({ query, options }) {
		const newOptions = this.generateOptions(options)
		return await this.userRepository.getBy({ query, options: newOptions })
	}

	async getUserById(id, options = {}) {
		return await this.getUserBy({ query: { id }, options })
	}

	async getUserByEmail(email, options = {}) {
		return await this.getUserBy({ query: { email }, options })
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