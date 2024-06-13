const { InvariantError, NotFoundError, BadRequestError } = require('../libs/exceptions')
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

		const redisKey = `wallets:W-${wallet.id}`
		const promises = [this.walletRepository.adjustBalanceBy({ query, counter }).then(() => success = true)]
		if (wallet) {
			promises.push(destroyCache(redisKey))
			promises.push(destroyCache(`wallets:U-${wallet.userId}`))
		}

		await Promise.all(promises)
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
	
	async getAndCountWallets({ query, options, redisKey }) {
		if (!redisKey) throw new InvariantError('Redis key is required')

		const jsonCached = await getCache(redisKey)
		if (jsonCached) {
			return jsonCached
		}

		const wallets = await this.walletRepository.getPagination({ query, options })
		await setCache(redisKey, wallets)

		return wallets
	}

	async getWalletBy({ query, options }) {
		const redisKey = `wallets:W-${query.id}`
		const jsonCached = await getCache(redisKey)
		if (jsonCached) {
			return jsonCached
		}

		const wallet = await this.walletRepository.getBy({ query, options })
		if (wallet) await setCache(redisKey, wallet)
		return wallet
	}

	async updateWalletBy({ query, data }) {
		const wallet = await this.getWalletBy({ query })
		const key = `wallets:W-${wallet.id}`
		const updatePromises = [this.walletRepository.updateBy({ query, data })]
		if (wallet) {
			updatePromises.push(destroyCache(key))
			updatePromises.push(destroyCache(`wallets:U-${wallet.userId}`))
		}

		const [updated] = await Promise.all(updatePromises)
		return updated
	}

	setTransaction(transaction) {
		this.walletRepository.transaction = transaction
	}
}

module.exports = WalletService