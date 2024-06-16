const { getPaginationCategories, storeCategory, getCategoryBySlug } = require('../controllers/category')
const { authenticate, validateSchema, wrapHandler } = require('../libs/middlewares')
const { createSchema } = require('../validators/category')

const categoryRouter = (fastify, options, done) => {
	fastify.get('/', ...wrapHandler(
		getPaginationCategories
	))
	fastify.get('/:slug', ...wrapHandler(
		getCategoryBySlug
	))
	fastify.post('/', ...wrapHandler(
		authenticate,
		validateSchema(createSchema),
		storeCategory
	))

	done()
}

module.exports = categoryRouter
