const { sequelize, Sequelize, Op } = require('../databases/models')
const { BadRequestError, ForbiddenError, InvariantError } = require('../libs/exceptions')

const WalletService = require('../services/wallet')
const walletService = new WalletService()

const storeWallet = async (req, res) => {
	const transaction = await sequelize.transaction()
	try {
		walletService.setTransaction(transaction)
		if (req.error) throw req.error

		const { id: userId } = req.user
		const { name } = req.body

		const wallet = await walletService.createWallet({ userId, name })
		if (!wallet) throw new InvariantError('Failed to create wallet')
		await transaction.commit()

		req.result = wallet
		req.statusCode = 201
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		walletService.setTransaction(null)
		req.error = error
	}
}

const getPaginationWallets = async (req, res) => {
	try {
		if (req.error) throw req.error

		const { q: name, limit, page } = req.query
		const { id: userId } = req.user

		let redisKey = 'wallets'
		if (name || limit || page) {
			const queryParams = new URLSearchParams(req.query)
			redisKey += `:Q-${queryParams.toString()}`
		}

		const userCondition = { userId }
		let query = userCondition
		if (name) {
			// do the query for lowered column name
			query = {
				[Op.and]: [
					Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('name')), {
						[Op.like]: `%${name.toLowerCase()}%`,
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

		req.result = await walletService.getAndCountWallets({ query, options, redisKey })
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

		const { id } = req.params
		const { id: userId } = req.user

		const [wallet, countWalletId] = await Promise.all([
			walletService.getWalletBy({ query: { id, userId } }),
			walletService.countWallets({ query: { id } })
		])

		if (!wallet && countWalletId > 0) throw new ForbiddenError('You are not authorized to access this wallet')
		else if (!wallet) throw new InvariantError('Wallet not found')

		req.result = wallet
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		req.error = error
	}
}

const updateWalletById = async (req, res) => {
	const transaction = await sequelize.transaction()
	try {
		walletService.setTransaction(transaction)
		if (req.error) throw req.error

		const { id } = req.params
		const { id: userId } = req.user
		const { name } = req.body

		const [walletUpdated] = await walletService.updateWalletBy({ query: { id, userId }, data: { name } })
		if (!walletUpdated || walletUpdated === 0) throw new BadRequestError('Failed to update wallet')
		await transaction.commit()

		req.message = 'Wallet updated successfully'
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		walletService.setTransaction(null)
		req.error = error
	}
}

const deleteWalletById = async (req, res) => {
	const transaction = await sequelize.transaction()
	try {
		walletService.setTransaction(transaction)
		if (req.error) throw req.error

		const { id } = req.params
		const { id: userId } = req.user

		const deleted = await walletService.deleteWalletBy({ query: { id, userId } })
		if (!deleted || deleted === 0) throw new BadRequestError('Failed to delete wallet')
		await transaction.commit()

		req.message = 'Wallet deleted successfully'
	} catch (error) {
		if (!(error instanceof Error)) {
			error = new InvariantError(error.message)
		}

		await transaction.rollback()
		walletService.setTransaction(null)
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