require('dotenv').config({ override: true })
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const router = require('./routers')

const app = express()
const { PORT = 3000, HOST = '0.0.0.0', NODE_ENV } = process.env

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use('/api', router)

app.listen(PORT, HOST, () => {
	console.log(`Server is running on ${HOST}:${PORT}`)
})
