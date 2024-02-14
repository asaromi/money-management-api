const { handleResponse, authenticate, validateAuthSchema, wrapHandler } = require('../libs/middlewares')
const { getPaginationTransactions, storeTransaction, getTransactionById } = require('../controllers/transaction')
const { createOrUpdateSchema } = require('../validators/transaction')

const transactionRouter = (fastify, options, done) => {
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateAuthSchema(createOrUpdateSchema),
		storeTransaction,
		handleResponse
	))
	fastify.get('/', ...wrapHandler(
		authenticate,
		getPaginationTransactions,
		handleResponse
	))
	fastify.get('/:id', ...wrapHandler(
		authenticate,
		getTransactionById,
		handleResponse
	))

	done()
}

module.exports = transactionRouter
