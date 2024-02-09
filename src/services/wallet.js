const WalletRepository = require('../repositories/wallet')

class WalletService {
	constructor() {
		this.walletRepository = new WalletRepository()
	}

	async countWallets({ query }) {
		return this.walletRepository.countBy({ query })
	}
	
	async createWallet(payload) {
		return this.walletRepository.storeData(payload)
	}
	
	async getAndCountWallets({ query, options }) {
		return this.walletRepository.getPagination({ query, options })
	}

	async getWalletBy({ query, options }) {
		return this.walletRepository.getBy({ query, options })
	}

	async updateWalletBy({ query, data }) {
		return this.walletRepository.updateBy({ query, data })
	}
	
	async deleteWalletBy({ query }) {
		return this.walletRepository.deleteBy({ query })
	}

	setTransaction(transaction) {
		this.walletRepository.transaction = transaction
	}
}

module.exports = WalletService