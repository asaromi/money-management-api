const { InvariantError, NotFoundError, BadRequestError } = require('../libs/exceptions')
const { redisClient } = require('../configs/redis')
const TransactionRepository = require('../repositories/transaction')
const { debug } = require('../libs/response')

class TransactionService {
	constructor() {
		this.transactionRepository = new TransactionRepository()
	}

	async countTransactions({ query }) {
		return await this.transactionRepository.countBy({ query })
	}

	async createTransaction(payload) {
		const transaction = await this.transactionRepository.storeData(payload)

		if (!transaction && !payload?.walletId) {
			throw new InvariantError('Failed to create transaction')
		}

		await redisClient.del(`transactions:U-${payload.userId}`)
		return transaction
	}

	async deleteTransactionBy({ query }) {
		if (!query.userId) throw new InvariantError('User ID is required')

		const transaction = await this.getTransactionBy({ query })
		const key = `transactions:T-${transaction.id}`
		const deletePromises = [this.transactionRepository.deleteBy({ query })]
		if (transaction) {
			deletePromises.push(redisClient.del(key))
			deletePromises.push(redisClient.del(`transactions:U-${transaction.userId}`))
		}

		const [deleted] = await Promise.all(deletePromises)
		return deleted
	}

	async getAndCountTransactions({ query, options, redisKey }) {
		if (!redisKey) throw new InvariantError('Redis key is required')

		const cached = await redisClient.get(redisKey)
		if (cached) {
			return JSON.parse(cached)
		}

		const transactions = await this.transactionRepository.getPagination({ query, options })
		await redisClient.set(redisKey, JSON.stringify(transactions))
		await redisClient.expire(redisKey, 300)
		return transactions
	}

	async getTransactionBy({ query, options }) {
		const redisKey = `transactions:T-${query.id}`

		if (options?.raw !== false) {
			const cached = await redisClient.get(redisKey)
			if (cached) {
				debug('cached from redis', cached)
				return JSON.parse(cached)
			}
		}

		const transaction = await this.transactionRepository.getBy({ query, options })
		if (transaction) {
			debug('new transaction cached', transaction)
			await redisClient.set(redisKey, JSON.stringify(transaction))
			await redisClient.expire(redisKey, 300)
		}

		return transaction
	}

	async updateTransactionBy({ query, payload }) {
		const transaction = await this.getTransactionBy({ query, options: { raw: true } })
		if (!transaction) {
			throw new NotFoundError('Transaction not found')
		}


		let counter = 0
		for (const key in payload) {
			if (transaction[key] === payload[key]) {
				delete payload[key]
				continue
			}

			if (key === 'amount') {
				counter = payload[key] - transaction[key]
				debug('amount', payload[key], transaction[key])
				debug('counter', counter)
			}

			transaction[key] = payload[key]
		}

		const redisKey = `transactions:T-${query.id}`
		const [updatedRows] = await Promise.all([
			this.transactionRepository.updateBy({ query, data: payload }),
			redisClient.del(redisKey),
			redisClient.del(`transactions:U-${query.userId}`),
		])

		if (!updatedRows) {
			throw new BadRequestError('Failed to update transaction')
		}

		debug('counter', counter)
		debug('updated', transaction)
		return { counter, updated: transaction }
	}

	setTransaction(transaction) {
		this.transactionRepository.transaction = transaction
	}
}

module.exports = TransactionService