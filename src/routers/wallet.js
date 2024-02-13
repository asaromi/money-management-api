const { wrapHandler } = require('../libs/formatter')
const { authenticate, handleResponse, validateSchema } = require('../libs/middlewares')
const { createOrUpdateSchema } = require('../validators/wallet')
const { getPaginationWallets, storeWallet, getWalletById, updateWalletById, deleteWalletById } = require('../controllers/wallet')

const walletRouter = (fastify, options, done) => {
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateSchema(createOrUpdateSchema),
		storeWallet,
		handleResponse
	))
	fastify.get('/', ...wrapHandler(
		authenticate,
		getPaginationWallets,
		handleResponse
	))
	fastify.get('/:id', ...wrapHandler(
		authenticate,
		getWalletById,
		handleResponse
	))
	fastify.put('/:id', ...wrapHandler(
		authenticate,
		validateSchema(createOrUpdateSchema),
		updateWalletById,
		handleResponse
	))
	fastify.delete('/:id', ...wrapHandler(
		authenticate,
		deleteWalletById,
		handleResponse
	))

	done()
}

module.exports = walletRouter
