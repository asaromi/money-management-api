const { Op, sequelize, Category, Wallet } = require('../configs/db/models')
const { TRANSACTION_TYPE } = require('../libs/constant')
const { BadRequestError, NotFoundError } = require('../libs/exceptions')
const TransactionService = require('../services/transaction')
const WalletService = require('../services/wallet')
const { debug } = require('../libs/response')
const { resultSuccess, catchError } = require('../libs/helpers')

const transactionService = new TransactionService()
const walletService = new WalletService()

const detailTransaction = (transaction) => {
	const amount = Number(transaction.amount)
	const timestamp = Number(transaction.timestamp)
	const strAmount = Math.abs(amount).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
	const date = new Date(timestamp).toISOString()
	const categoryName = transaction?.categoryName || 'Uncategorized'

	return {
		...transaction,
		categoryName,
		amount,
		strAmount,
		timestamp,
		date,
	}
}

const storeTransaction = async (req, _res) => {
	const dbTransaction = await sequelize.transaction()

	try {
		transactionService.setTransaction(dbTransaction)
		walletService.setTransaction(dbTransaction)
		if (req.error) throw req.error


		let { type } = req.body
		if (!req.body.categoryId && type !== TRANSACTION_TYPE.ADJUST) {
			throw new BadRequestError('Category ID is required')
		} else if (!type && req.body.amount > 0) {
			type = TRANSACTION_TYPE.INCOME
		}

		const {
			user: { id: userId },
			body: { amount: counter, walletId: id }
		} = req
		const walletQuery = { userId, id }
		const [transaction, calculated] = await Promise.all([
			transactionService.createTransaction({ ...req.body, userId, type }),
			walletService.recalculateWalletBalance({ query: walletQuery, counter }),
		])

		if (!transaction) throw new BadRequestError('Failed to create transaction')

		await dbTransaction.commit()
		resultSuccess(req, transaction, 201)
	} catch (error) {
		await dbTransaction.rollback()
		catchError(req, error)
	} finally {
		transactionService.setTransaction(null)
		walletService.setTransaction(null)
	}
}

const getPaginationTransactions = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { id: userId } = req.user
		const { q: search, start, end, wallet: walletId, category: categoryId, page, limit } = req.query

		const query = { userId, timestamp: {} }
		if (search) {
			query[Op.or] = [
				{ description: { [Op.iLike]: `%${search}%` } },
				{ '$wallet.name$': { [Op.iLike]: `%${search}%` } },
				{ '$category.name$': { [Op.iLike]: `%${search}%` } },
			]
		}

		if (!start && !end) delete query.timestamp
		else {
			if (start) query.timestamp[Op.gte] = start
			if (end) query.timestamp[Op.lte] = end
		}

		if (walletId) query.walletId = { [Op.in]: walletId.split(',') }
		if (categoryId) query.categoryId = { [Op.in]: categoryId.split(',') }

		debug('query', query)

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
				},
			],
			order: [
				['timestamp', 'DESC'],
				['id', 'ASC'],
			],
			limit,
			page,
		}

		const result = await transactionService.getAndCountTransactions({ query, options })
		resultSuccess(req, result)
	} catch (error) {
		catchError(req, error)
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
				[sequelize.col('wallet.name'), 'walletName'],
				'walletId',
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
				},
			],
		}

		let transaction = await transactionService.getTransactionBy({ query, options })
		if (!transaction) throw new NotFoundError('Transaction not found')

		resultSuccess(req, detailTransaction(transaction))
	} catch (error) {
		catchError(req, error)
	}
}

const updateTransactionById = async (req, _res) => {
	const dbTransaction = await sequelize.transaction()
	try {
		transactionService.setTransaction(dbTransaction)
		walletService.setTransaction(dbTransaction)

		if (req.error) throw req.error

		const {
			user: { id: userId },
			params: { id },
			body: { walletId }
		} = req

		const query = { id, userId }
		const { counter, updated: [_, transaction], oldWallet } = await transactionService.updateTransactionBy({
			query: { ...query, walletId },
			payload: req.body,
			returning: true
		})

		if (!transaction) throw new BadRequestError('Failed to update transaction')

		const promiseAffectedWallets = []
		if (counter[0] !== 0) {
			const walletQuery = { userId, id: oldWallet }
			promiseAffectedWallets.push(
				walletService.recalculateWalletBalance({ query: walletQuery, counter: counter[0] })
			)
		}
		if (counter[1] !== 0) {
			const walletQuery = { userId, id: transaction[0].walletId }
			promiseAffectedWallets.push(
				walletService.recalculateWalletBalance({ query: walletQuery, counter: counter[1] })
			)
		}

		await Promise.all(promiseAffectedWallets)
		await dbTransaction.commit()

		resultSuccess(req, transaction, 200)
	} catch (error) {
		await dbTransaction.rollback()
		catchError(req, error)
	} finally {
		transactionService.setTransaction(null)
		walletService.setTransaction(null)
	}
}



module.exports = {
	storeTransaction,
	getPaginationTransactions,
	getTransactionById,
	updateTransactionById
}
