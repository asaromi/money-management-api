const { Op, sequelize, Category, Wallet } = require('../databases/models')
const { InvariantError, BadRequestError, NotFoundError } = require('../libs/exceptions')
const TransactionService = require('../services/transaction')
const { TRANSACTION_TYPE } = require('../libs/constant')
const { debug } = require('../libs/response')

const transactionService = new TransactionService()

const storeTransaction = async (req, res) => {
	const dbTransaction = await sequelize.transaction()
	try {
		transactionService.setTransaction(dbTransaction)
		if (req.error) throw req.error

		const { id: userId } = req.user
		let type = req.body.type
		if (!type && req.body.amount > 0) type = TRANSACTION_TYPE.INCOME

		const transaction = await transactionService.createTransaction({ ...req.body, userId, type })
		if (!transaction) throw new BadRequestError('Failed to create transaction')
		await dbTransaction.commit()

		req.result = transaction
		req.statusCode = 201
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await dbTransaction.rollback()
		transactionService.setTransaction(null)
		req.error = error
	}
}

const getPaginationTransactions = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { id: userId } = req.user
		const { q: desc, start, end, wallet: walletId, category: categoryId,  page, limit } = req.query

		let redisKey = `transactions:U-${userId}`
		if (desc || start || end || walletId || categoryId || limit || page) {
			const queryParams = new URLSearchParams(req.query)
			redisKey += `_Q-${queryParams.toString()}`
		}

		const query = { userId, timestamp: {} }
		if (desc) query.description = { [Op.like]: `%${desc}%` }

		if (!start && !end) delete query.timestamp
		else {
			if (start) query.timestamp[Op.gte] = start
			if (end) query.timestamp[Op.lte] = end
		}

		if (walletId) query.walletId = walletId
		if (categoryId) query.categoryId = categoryId

		const options = {
			attributes: [
				'id',
				'amount',
				'description',
				'type',
				'timestamp',
				'walletId',
				[sequelize.col('wallet.name'), 'walletName'],
				'categoryId',
				[sequelize.col('category.name'), 'categoryName'],
			],
			raw: true,
			include: [
				{
					model: Wallet,
					as: 'wallet',
					attributes: [],
					required: true,
				},
				{
					model: Category,
					as: 'category',
					attributes: [],
					required: true,
				},
			],
			order: [
				['timestamp', 'DESC'],
				['id', 'ASC'],
			],
			limit,
			page,
		}

		const result = await transactionService.getAndCountTransactions({ query, options, redisKey })
		result.data.forEach((transaction) => {
			transaction.timestamp = Number(transaction.timestamp)
			transaction.amount = Number(transaction.amount)
			transaction.date = new Date(transaction.timestamp)
			transaction.strAmount = transaction.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
		})

		req.result = result
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const getTransactionById = async (req, res) => {
	try {
		if (req.error) throw req.error

		const query = { id: req.params.id, userId: req.user.id }
		const options = {
			attributes: [
				'id',
				'amount',
				'description',
				'type',
				'timestamp',
				'categoryId',
				'walletId',
				[sequelize.col('wallet.name'), 'walletName'],
				[sequelize.col('category.name'), 'categoryName'],
			],
			raw: true,
			include: [
				{
					model: Wallet,
					attributes: ['id', 'name'],
					required: true,
				},
				{
					model: Category,
					attributes: ['id', 'name'],
					required: true,
				},
			],
		}

		const redisKey = `transaction:T-${req.params.id}_U-${req.user.id}`
		let transaction = await transactionService.getTransactionBy({ query, options, redisKey })
		if (!transaction) throw new NotFoundError('Transaction not found')

		transaction.timestamp = Number(transaction.timestamp)
		transaction.amount = Number(transaction.amount)
		transaction.date = new Date(transaction.timestamp)
		transaction.strAmount = transaction.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
		req.result = transaction
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

module.exports = { storeTransaction, getPaginationTransactions, getTransactionById }
