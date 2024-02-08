const UserRepository = require('../repositories/user')

class UserService {
	constructor(transaction) {
		this._userRepository = new UserRepository(transaction)
	}

	async createUser(payload) {
		return this._userRepository.createUser(payload)
	}

	async getUserById(id, options = {}) {
		const newOptions = this.generateOptions(options)

		console.log(newOptions)
		return this._userRepository.getBy({ query: { id }, options: newOptions })
	}

	async getUserByEmail(email, options = {}) {
		const newOptions = this.generateOptions(options)

		console.log(newOptions)
		return this._userRepository.getBy({ query: { email }, options: newOptions })
	}

	generateOptions(options = {}) {
		const { isLogin, isMiddleware, attributes = {}, ...newOptions } = options
		if (Array.isArray(attributes)) {
			newOptions.attributes = {
				include: attributes,
				exclude: ['password', 'deletedAt'],
			}
		} else {
			attributes.exclude = [...new Set([...attributes.exclude || [], 'password'])]
			newOptions.attributes = attributes
		}

		if (isLogin || isMiddleware) {
			newOptions.attributes.exclude = attributes.exclude.filter((attribute) => attribute !== 'password')
		}

		return newOptions
	}
}

module.exports = UserService