const { getPaginationCategories, storeCategory } = require('../controllers/category')
const { handleResponse, authenticate, validateSchema, wrapHandler } = require('../libs/middlewares')
const { createSchema } = require('../validators/category')

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
		validateSchema(createSchema),
		storeCategory,
		handleResponse
	))

	done()
}

module.exports = categoryRouter
