const { authenticate, validateAuthSchema, wrapHandler } = require('../libs/middlewares')
const { createOrUpdateSchema } = require('../validators/wallet')
const { getPaginationWallets, storeWallet, getWalletById, updateWalletById, deleteWalletById } = require('../controllers/wallet')

const walletRouter = (fastify, options, done) => {
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateAuthSchema(createOrUpdateSchema),
		storeWallet
	))
	fastify.get('/', ...wrapHandler(
		authenticate,
		getPaginationWallets
	))
	fastify.get('/:id', ...wrapHandler(
		authenticate,
		getWalletById
	))
	fastify.put('/:id', ...wrapHandler(
		authenticate,
		validateAuthSchema(createOrUpdateSchema),
		updateWalletById
	))
	fastify.delete('/:id', ...wrapHandler(
		authenticate,
		deleteWalletById
	))

	done()
}

module.exports = walletRouter
