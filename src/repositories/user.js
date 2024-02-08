const BaseRepository = require('./index')
const { User } = require('../databases/models')

class UserRepository extends BaseRepository {
	constructor(transaction) {
		super(User, transaction)
	}

	async createUser(payload) {
		return this.model.create(payload, { transaction: this.transaction })
	}
}

module.exports = UserRepository
