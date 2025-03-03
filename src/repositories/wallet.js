const BaseRepository = require('./index')
const { Wallet } = require('../configs/db/models')
const { debug } = require('../libs/response')

class WalletRepository extends BaseRepository {
	constructor(transaction) {
		super(Wallet, transaction)
	}

	async adjustBalanceBy({ query, counter }) {
		debug('Adjusting wallet balance by', counter)
		return await this.model.increment('balance', { by: counter, where: query, transaction: this.transaction })
	}
}

module.exports = WalletRepository