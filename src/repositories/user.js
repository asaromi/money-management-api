const BaseRepository = require('./index')
const { User } = require('../configs/db/models')

class UserRepository extends BaseRepository {
	constructor(transaction) {
		super(User, transaction)
	}
}

module.exports = UserRepository
