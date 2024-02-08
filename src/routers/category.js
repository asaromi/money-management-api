const { Router } = require('express')
const { handleResponse, validateSchema, authenticate } = require('../libs/middlewares')
const {
	createSchema: createCategorySchema,
	updateSchema: updateCategorySchema,
} = require('../validators/category')
const {
	deleteCategoryById,
	getCategories,
	getCategoryBySlug,
	storeCategory,
	updateCategoryById,
} = require('../controllers/category')
const router = new Router()

router.get('/', getCategories, handleResponse)
router.get('/:slug', getCategoryBySlug, handleResponse)
router.post(
	'/',
	authenticate,
	validateSchema(createCategorySchema),
	storeCategory,
	handleResponse,
)
router.put(
	'/:id',
	authenticate,
	validateSchema(updateCategorySchema),
	updateCategoryById,
	handleResponse,
)
router.delete(
	'/:id',
	authenticate,
	deleteCategoryById,
	handleResponse,
)

module.exports = router