require('dotenv').config({ override: true })
const express = require('express')
const app = express()
const cors = require('cors')
const router = require('./routers')


const { PORT = 3000, HOST = '0.0.0.0' } = process.env

app.use(cors())
app.use(express.json())
app.use('/api', router)

app.listen(PORT, HOST, () => {
	console.log(`Server is running on ${HOST}:${PORT}`)
})
