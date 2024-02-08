const { Router } = require('express')
const { handleResponse } = require('../libs/middleware')
const authRouter = require('./auth')
const router = new Router()

router.get('/', handleResponse)
router.use('/auth', authRouter)

module.exports = router