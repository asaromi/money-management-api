const { Router } = require('express')
const { handleResponse } = require('../libs/middlewares')
const router = new Router()

const authRouter = require('./auth')
// const categoryRouter = require('./category')

router.get('/', handleResponse)
router.use('/auth', authRouter)
// router.use('/categories', categoryRouter)

module.exports = router