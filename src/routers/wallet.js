const { Router } = require('express')
const { handleResponse, validateSchema, authenticate } = require('../libs/middlewares')
const { createOrUpdateSchema } = require('../validators/wallet')
const {
	deleteWalletById,
	getPaginationWallets,
	getWalletById,
	storeWallet,
	updateWalletById,
} = require('../controllers/wallet')
const router = new Router()

router.post(
	'/',
	authenticate,
	validateSchema(createOrUpdateSchema),
	storeWallet,
	handleResponse,
)
router.get('/',
	authenticate,
	getPaginationWallets,
	handleResponse,
)
router.get('/:id',
	authenticate,
	getWalletById,
	handleResponse
)
router.put(
	'/:id',
	authenticate,
	validateSchema(createOrUpdateSchema),
	updateWalletById,
	handleResponse
)
router.delete('/:id', authenticate, deleteWalletById, handleResponse)

module.exports = router