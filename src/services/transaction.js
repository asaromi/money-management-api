const TransactionRepository = require('../repositories/transaction')
const { InvariantError } = require('../libs/exceptions')
const { redisClient } = require('../configs/redis')
const { debug } = require('../libs/response')

class TransactionService {
	constructor() {
		this.transactionRepository = new TransactionRepository()
	}

	async createTransaction(payload) {
		const transaction = await this.transactionRepository.storeData(payload)
		if (transaction) {
			await redisClient.del(`transactions:U-${payload.userId}`)
		}

		return transaction
	}

	async getAndCountTransactions({ query, options, redisKey }) {
		if (!redisKey) throw new InvariantError('Redis key is required')

		// const cached = await redisClient.get(redisKey)
		// if (cached) {
		// 	debug('Using cached transactions')
		// 	return JSON.parse(cached)
		// }

		const transactions = await this.transactionRepository.getPagination({ query, options })
		await redisClient.set(redisKey, JSON.stringify(transactions), { 'EX': 300 })
		return transactions
	}

	async getTransactionBy({ query, options, redisKey }) {
		if (!redisKey) throw new InvariantError('Redis key is required')

		if (query.id) {
			redisKey += `_T-${query.id}`
		}

		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const transaction = await this.transactionRepository.getBy({ query, options })
		if (transaction) {
			await redisClient.set(redisKey, JSON.stringify(transaction), { 'EX': 300 })
		}
		return transaction
	}

	setTransaction(transaction) {
		this.transactionRepository.transaction = transaction
	}
}

module.exports = TransactionService