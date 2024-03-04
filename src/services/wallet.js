const { destroyCache, getCache, setCache } = require('../libs/redis')
const { InvariantError, NotFoundError } = require('../libs/exceptions')

const WalletRepository = require('../repositories/wallet')

class WalletService {
	constructor() {
		this.walletRepository = new WalletRepository()
	}

	async recalculateWalletBalance({ query, counter }) {
		let success = false
		if (!query.userId) throw new InvariantError('User ID is required')

		const wallet = await this.getWalletBy({ query })
		if (!wallet) throw new NotFoundError('Wallet not found')

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
		if (wallet) {
			await destroyCache(`wallets:U-${payload.userId}`)
		}

		return wallet
	}

	async deleteWalletBy({ query }) {
		if (!query.userId) throw new InvariantError('User ID is required')

		const wallet = await this.getWalletBy({ query })
		const key = `wallets:W-${wallet.id}`
		const deletePromises = [this.walletRepository.deleteBy({ query })]
		if (wallet) {
			deletePromises.push(destroyCache(key))
			deletePromises.push(destroyCache(`wallets:U-${wallet.userId}`))
		}

		const [deleted] = await Promise.all(deletePromises)
		return deleted
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