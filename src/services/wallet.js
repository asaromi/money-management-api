const { redisClient } = require('../configs/redis')
const { InvariantError } = require('../libs/exceptions')
const WalletRepository = require('../repositories/wallet')

class WalletService {
	constructor() {
		this.walletRepository = new WalletRepository()
	}

	async countWallets({ query }) {
		return this.walletRepository.countBy({ query })
	}
	
	async createWallet(payload) {
		const wallet = await this.walletRepository.storeData(payload)
		if (wallet) {
			await redisClient.del('wallets')
		}

		return wallet
	}

	async deleteWalletBy({ query }) {
		const wallet = await this.getWalletBy({ query })
		const key = `wallets:W-${wallet.id}`
		const deletePromises = [this.walletRepository.deleteBy({ query })]
		if (wallet) {
			deletePromises.push(redisClient.del(key))
			deletePromises.push(redisClient.del('wallets'))
		}

		const [deleted] = await Promise.all(deletePromises)
		return deleted
	}
	
	async getAndCountWallets({ query, options, redisKey }) {
		if (!redisKey) throw new InvariantError('Redis key is required')

		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const wallets = await this.walletRepository.getPagination({ query, options })
		await redisClient.set(redisKey, JSON.stringify(wallets), { 'EX': 300 })
		return wallets
	}

	async getWalletBy({ query, options }) {
		const redisKey = `wallets:W-${query.id}`
		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const wallet = await this.walletRepository.getBy({ query, options })
		if (wallet) {
			await redisClient.set(redisKey, JSON.stringify(wallet), { 'EX': 300 })
		}
		return wallet
	}

	async updateWalletBy({ query, data }) {
		const wallet = await this.getWalletBy({ query })
		const key = `wallets:W-${wallet.id}`
		const updatePromises = [this.walletRepository.updateBy({ query, data })]
		if (wallet) {
			updatePromises.push(redisClient.del(key))
			updatePromises.push(redisClient.del('wallets'))
		}

		const [updated] = await Promise.all(updatePromises)
		return updated
	}

	setTransaction(transaction) {
		this.walletRepository.transaction = transaction
	}
}

module.exports = WalletService