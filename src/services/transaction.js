const { Transaction } = require('../configs/db/models')
const { debug } = require('../libs/response')
const { InvariantError, NotFoundError, BadRequestError } = require('../libs/exceptions')
const TransactionRepository = require('../repositories/transaction')

class TransactionService {
	constructor() {
		this.transactionRepository = new TransactionRepository()
	}

	async countTransactions({ query }) {
		return await this.transactionRepository.countBy({ query })
	}

	async createTransaction(payload) {
		const transaction = await this.transactionRepository.storeData(payload)
		if (!transaction) throw new InvariantError('Failed to create transaction')

		return transaction
	}

	async deleteTransactionBy({ query }) {
		if (!query.userId) throw new BadRequestError('User ID is required')

		return await this.transactionRepository.deleteBy({ query })
	}

	async getAndCountTransactions({ query, options }) {
		return await this.transactionRepository.getPagination({ query, options })
	}

	async getTransactionBy({ query, options }) {
		return await this.transactionRepository.getBy({ query, options })
	}

	/**
	 * @typedef {{ counter: [new: number, updated: number], updated: [affectedCount: number, affectedRows: Transaction[]] }} Result
	 * @param {{ query: Object, payload: Object }}
	 * @returns Promise<Result>
	 */
	async updateTransactionBy({ query, payload, returning = false }) {
		const transaction = await this.getTransactionBy({ query, options: { raw: true, include: [], } })
		if (!transaction) {
			throw new NotFoundError('Transaction not found')
		}

		let counter = [0, 0] // [old, new]
		const oldWallet = transaction.walletId


		for (const key in payload) {
			if (transaction[key] === payload[key]) {
				delete payload[key]
				continue
			}

			if (key === 'amount') {
				counter[0] = payload[key] - transaction[key]
			}

			if (key === 'walletId' && payload[key] && payload[key] !== transaction[key]) {
				counter[0] = -transaction.amount
				counter[1] = Number(payload.amount || transaction.amount)
			}

			transaction[key] = payload[key]
		}

		const updatedRows = await this.transactionRepository.updateBy({ query, data: payload, returning })
		if (!updatedRows[0]) {
			throw new BadRequestError('Failed to update transaction')
		}

		debug('updated transaction', updatedRows[1])
		return { counter, updated: updatedRows, oldWallet }
	}

	setTransaction(transaction) {
		this.transactionRepository.transaction = transaction
	}
}


module.exports = TransactionService