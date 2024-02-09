const BaseRepository = require('./index')
const { Wallet } = require('../databases/models')

class WalletRepository extends BaseRepository {
	constructor(transaction) {
		super(Wallet, transaction)
	}
}

module.exports = WalletRepository