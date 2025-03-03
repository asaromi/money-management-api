const {
	InvariantError,
	NotFoundError,
	BadRequestError,
} = require('../libs/exceptions')
const { debug } = require('../libs/response')
const WalletRepository = require('../repositories/wallet')

class WalletService {
	constructor() {
		this.walletRepository = new WalletRepository()
	}

	async recalculateWalletBalance({ query, counter }) {
		let success = false
		if (!query.userId) throw new BadRequestError('User ID is required')

		const wallet = await this.getWalletBy({ query })
		if (!wallet) throw new NotFoundError('Wallet not found')

		debug('Recalculating wallet balance by', counter)

		await this.walletRepository.adjustBalanceBy({
			query,
			counter,
		}).then(() => success = true)
		return success
	}

	async countWallets({ query }) {
		return this.walletRepository.countBy({ query })
	}

	async createWallet(payload) {
		const wallet = await this.walletRepository.storeData(payload)
		if (!wallet) throw new InvariantError('Failed to create wallet')

		return wallet
	}

	async deleteWalletBy({ query }) {
		if (!query.userId) throw new BadRequestError('User ID is required')

		return await this.walletRepository.deleteBy({ query })
	}

	async getAndCountWallets({ query, options }) {
		return await this.walletRepository.getPagination({ query, options })
	}

	async getWalletBy({ query, options }) {
		const wallet = await this.walletRepository.getBy({ query, options })
		if (!wallet) throw new NotFoundError('Wallet not found')

		return wallet
	}

	async updateWalletBy({ query, data }) {
		if (!query.userId) throw new BadRequestError('User ID is required')

		return await this.walletRepository.updateBy({ query, data })
	}

	setTransaction(transaction) {
		this.walletRepository.transaction = transaction
	}
}

module.exports = WalletService