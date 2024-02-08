require('dotenv').config()
const { verify, sign } = require('jsonwebtoken')
const { debug } = require('./response')
const { JWT_SECRET: secret, JWT_ALGORITHM: algorithm = 'HS256' } = process.env
const expiresIn = '1d'

exports.generateToken = async (payload) => {
  return await sign(payload, secret, {
    expiresIn,
    algorithm
  })
}

exports.verifyToken = async (token) => await verify(token, secret, { algorithm })
