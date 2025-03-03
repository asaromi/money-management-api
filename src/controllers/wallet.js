const { sequelize, Sequelize, Op } = require('../configs/db/models')
const {
	BadRequestError,
	ForbiddenError,
	NotFoundError,
} = require('../libs/exceptions')
const TransactionService = require('../services/transaction')
const WalletService = require('../services/wallet')
const { resultSuccess, catchError } = require('../libs/helpers')

const walletService = new WalletService()
const transactionService = new TransactionService()

const simpleWallet = (wallet) => {
	const balance = Number(wallet.balance)
	return {
		id: wallet.id,
		name: wallet.name,
		balance,
		strBalance: balance.toLocaleString('id-ID', {
			style: 'currency',
			currency: 'IDR',
		}),
		updatedAt: wallet.updatedAt,
	}
}

const storeWallet = async (req, _res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error
		transactionService.setTransaction(transaction)
		walletService.setTransaction(transaction)

		const { id: userId } = req.user
		const { name } = req.body

		const wallet = await walletService.createWallet({ userId, name })
		if (!wallet) throw new BadRequestError('Failed to create wallet')

		await transaction.commit()
		resultSuccess(req, wallet, 201)
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	}
}

const getPaginationWallets = async (req, _res) => {
	try {
		if (req.error) throw req.error

		const { q: name, limit = '5', page = '1' } = req.query
		const { id: userId } = req.user

		const userCondition = { userId }
		let query = userCondition
		if (name) {
			// do the query for lowered column name
			query = {
				[Op.and]: [
					Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), {
						[Op.iLike]: `%${name.toLowerCase()}%`,
					}),
					userCondition,
				],
			}
		}

		const options = {
			attributes: ['id', 'name', 'updatedAt'],
			order: [
				['updatedAt', 'DESC'],
				['id', 'ASC'],
			],
			limit,
			page,
		}

		const result = await walletService.getAndCountWallets({ query, options })
		resultSuccess(req, {
			...result,
			data: result.data.map(simpleWallet),
		}, 200)
	} catch (error) {
		catchError(req, error)
	}
}

const getWalletById = async (req, _res) => {
	try {
		if (req.error) throw req.error

		const { params: { id }, user: { id: userId } } = req

		const transactionOptions = {
			limit: 5,
			order: [['id', 'DESC']],
		}

		const [wallet, countWalletId, transactions] = await Promise.all([
			walletService.getWalletBy({
				query: { id, userId },
				options: { raw: true },
			}),
			walletService.countWallets({ query: { id } }),
			transactionService.getAndCountTransactions({
				query: { userId, walletId: id },
				options: transactionOptions,
				redisKey: `transactions:U-${userId}_W-${id}`,
			}),
		])

		if (!wallet && countWalletId > 0) throw new ForbiddenError('You are not authorized to access this wallet')
		else if (!wallet) throw new NotFoundError('Wallet not found')

		resultSuccess(req, {
			...wallet,
			totalTransactions: transactions?.pagination?.total || 0,
			transactions: transactions,
		}, 200)
	} catch (error) {
		catchError(req, error)
	}
}

const updateWalletById = async (req, _res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error
		walletService.setTransaction(transaction)

		const { id } = req.params
		const { id: userId } = req.user
		const { name } = req.body

		const [walletUpdated] = await walletService.updateWalletBy({
			query: {
				id,
				userId,
			}, data: { name },
		})
		if (!walletUpdated || walletUpdated === 0) throw new BadRequestError('Failed to update wallet')

		await transaction.commit()
		resultSuccess(req, null, 200, 'Wallet updated successfully')
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	} finally {
		walletService.setTransaction(null)
	}
}

const deleteWalletById = async (req, _res) => {
	const transaction = await sequelize.transaction()
	try {
		if (req.error) throw req.error
		walletService.setTransaction(transaction)
		transactionService.setTransaction(transaction)

		const { id } = req.params
		const { id: userId } = req.user

		const [isExistWallet, countTransactions] = await Promise.all([
			walletService.getWalletBy({
				query: { id, userId },
				options: { raw: true },
			}),
			transactionService.countTransactions({ query: { walletId: id } }),
		])

		if (!isExistWallet) throw new NotFoundError('Wallet not found')

		const deletePromises = [walletService.deleteWalletBy({
			query: {
				id,
				userId,
			},
		})]
		if (countTransactions > 0) {
			deletePromises.push(transactionService.deleteTransactionBy({
				query: {
					walletId: id,
					userId,
				},
			}))
		}

		const [deletedWallet, deletedTransaction] = await Promise.all(deletePromises)

		if (!deletedWallet || deletedWallet === 0) {
			throw new BadRequestError('Failed to delete wallet')
		} else if (!deletedTransaction || deletedTransaction === 0) {
			throw new BadRequestError('Failed to delete transaction')
		}

		await transaction.commit()
		resultSuccess(req, null, 200, 'Wallet deleted successfully')
	} catch (error) {
		await transaction.rollback()
		catchError(req, error)
	} finally {
		walletService.setTransaction(null)
		transactionService.setTransaction(null)
	}
}

module.exports = {
	storeWallet,
	getPaginationWallets,
	getWalletById,
	updateWalletById,
	deleteWalletById,
}