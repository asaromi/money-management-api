const { handleResponse, authenticate, validateAuthSchema, wrapHandler } = require('../libs/middlewares')
const { getPaginationTransactions, storeTransaction, getTransactionById, updateTransactionById } = require('../controllers/transaction')
const { createSchema, updateSchema } = require('../validators/transaction')

const transactionRouter = (fastify, options, done) => {
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateAuthSchema(createSchema),
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
	fastify.patch('/:id', ...wrapHandler(
		authenticate,
		validateAuthSchema(updateSchema),
		updateTransactionById,
		handleResponse
	))

	done()
}

module.exports = transactionRouter
 