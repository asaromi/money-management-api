const { Router } = require('express')
const { handleResponse, validateSchema, authenticate } = require('../libs/middlewares')
const {	createSchema: createCategorySchema } = require('../validators/category')
const {	getCategories,	getCategoryBySlug, storeCategory } = require('../controllers/category')
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

module.exports = router