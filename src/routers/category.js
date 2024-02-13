const { getPaginationCategories, storeCategory } = require('../controllers/category')
const { handleResponse, authenticate, validateSchema } = require('../libs/middlewares')
const { wrapHandler } = require('../libs/formatter')
const { createOrUpdateSchema } = require('../validators/wallet')

const categoryRouter = (fastify, options, done) => {
	fastify.get('/', ...wrapHandler(
		getPaginationCategories,
		handleResponse
	))
	fastify.get('/:slug', ...wrapHandler(
		getPaginationCategories,
		handleResponse
	))
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateSchema(createOrUpdateSchema),
		storeCategory,
		handleResponse
	))

	done()
}

module.exports = categoryRouter
