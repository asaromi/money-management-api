const { authenticate, validateAuthSchema, wrapHandler } = require('../libs/middlewares')
const { getPaginationTransactions, storeTransaction, getTransactionById, updateTransactionById } = require('../controllers/transaction')
const { createSchema, updateSchema } = require('../validators/transaction')

const transactionRouter = (fastify, options, done) => {
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateAuthSchema(createSchema),
		storeTransaction
	))
	fastify.get('/', ...wrapHandler(
		authenticate,
		getPaginationTransactions
	))
	fastify.get('/:id', ...wrapHandler(
		authenticate,
		getTransactionById
	))
	fastify.patch('/:id', ...wrapHandler(
		authenticate,
		validateAuthSchema(updateSchema),
		updateTransactionById
	))

	done()
}

module.exports = transactionRouter
 