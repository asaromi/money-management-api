const { Router } = require('express')
// const authRouter = require('./auth')
const { handleResponse } = require('../libs/middleware')
const router = new Router()

router.get('/', handleResponse)
// router.use('/auth', authRouter)

module.exports = router