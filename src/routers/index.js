const { Router } = require('express')
const { handleResponse } = require('../libs/middlewares')
const router = new Router()

const authRouter = require('./auth')
const categoryRouter = require('./category')
const walletRouter = require('./wallet')

router.get('/', handleResponse)
router.use('/auth', authRouter)
router.use('/categories', categoryRouter)
router.use('/wallets', walletRouter)

module.exports = router