const BaseRepository = require('./index')
const { Transaction } = require('../configs/db/models')

class TransactionRepository extends BaseRepository {
	constructor(transaction) {
		super(Transaction, transaction)
	}
}

module.exports = TransactionRepository