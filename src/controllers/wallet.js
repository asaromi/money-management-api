const { sequelize, Sequelize, Op } = require('../databases/models')
const { BadRequestError, ForbiddenError, InvariantError, NotFoundError } = require('../libs/exceptions')
const TransactionService = require('../services/transaction')
const WalletService = require('../services/wallet')
const { debug } = require('../libs/response')

const walletService = new WalletService()
const transactionService = new TransactionService()

const simpleWallet = (wallet) => {
	const balance = Number(wallet.balance)
	return {
		id: wallet.id,
		name: wallet.name,
		balance,
		strBalance: balance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
		updatedAt: wallet.updatedAt
	}
}

const storeWallet = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { id: userId } = req.user
		const { name } = req.body

		const wallet = await walletService.createWallet({ userId, name })
		if (!wallet) throw new BadRequestError('Failed to create wallet')

		req.result = wallet
		req.statusCode = 201
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const getPaginationWallets = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { q: name, limit = '5', page = '1' } = req.query
		const { id: userId } = req.user

		let redisKey = `wallets:U-${userId}`
		if (name || limit !== '5' || page !== '1') {
			const queryParams = new URLSearchParams(req.query)
			redisKey += `_Q-${queryParams.toString()}`
		}

		debug('redisKey', redisKey)

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
			attributes: ['id', 'name', 'balance', 'updatedAt'],
			order: [
				['updatedAt', 'DESC'],
				['id', 'ASC'],
			],
			limit,
			page,
		}

		const result = await walletService.getAndCountWallets({ query, options, redisKey })
		req.result = {
			...result,
			data: result.data.map(simpleWallet),
		}
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const getWalletById = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { params: { id }, user: { id: userId } } = req

		const transactionOptions = {
			limit: 5,
			order: [['id', 'DESC']],
		}

		const [wallet, countWalletId, transactions] = await Promise.all([
			walletService.getWalletBy({ query: { id, userId }, options: { raw: true } }),
			walletService.countWallets({ query: { id } }),
			transactionService.getAndCountTransactions({
				query: { userId, walletId: id },
				options: transactionOptions,
				redisKey: `transactions:U-${userId}_W-${id}`
			})
		])

		if (!wallet && countWalletId > 0) throw new ForbiddenError('You are not authorized to access this wallet')
		else if (!wallet) throw new NotFoundError('Wallet not found')

		req.result = {
			...wallet,
			totalTransactions: transactions?.pagination?.total || 0,
			transactions: transactions
		}
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const updateWalletById = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { id } = req.params
		const { id: userId } = req.user
		const { name } = req.body

		const [walletUpdated] = await walletService.updateWalletBy({ query: { id, userId }, data: { name } })
		if (!walletUpdated || walletUpdated === 0) throw new BadRequestError('Failed to update wallet')

		req.message = 'Wallet updated successfully'
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const deleteWalletById = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { id } = req.params
		const { id: userId } = req.user

		const [isExistWallet, countTransactions] = await Promise.all([
			walletService.getWalletBy({ query: { id, userId }, options: { raw: true } }),
			transactionService.countTransactions({ query: { walletId: id } })
		])

		if (!isExistWallet) throw new NotFoundError('Wallet not found')
		if (countTransactions > 0) {
			const deleted = await transactionService.deleteTransactionBy({ query: { walletId: id } })
			if (!deleted || deleted === 0) throw new BadRequestError('Failed to delete transactions')
		}

		const deleted = await walletService.deleteWalletBy({ query: { id, userId } })
		if (!deleted || deleted === 0) throw new BadRequestError('Failed to delete wallet')

		req.message = 'Wallet deleted successfully'
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

module.exports = {
	storeWallet,
	getPaginationWallets,
	getWalletById,
	updateWalletById,
	deleteWalletById
}