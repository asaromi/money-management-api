const { authenticate, handleResponse, validateAuthSchema, wrapHandler } = require('../libs/middlewares')
const { createOrUpdateSchema } = require('../validators/wallet')
const { getPaginationWallets, storeWallet, getWalletById, updateWalletById, deleteWalletById } = require('../controllers/wallet')

const walletRouter = (fastify, options, done) => {
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateAuthSchema(createOrUpdateSchema),
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
		validateAuthSchema(createOrUpdateSchema),
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
