const BaseRepository = require('./index')
const { Transaction } = require('../databases/models')

class TransactionRepository extends BaseRepository {
	constructor(transaction) {
		super(Transaction, transaction)
	}
}

module.exports = TransactionRepository