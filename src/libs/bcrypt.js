const { compare, genSalt, hash } = require('bcrypt')

const saltRounds = 10
exports.hashPassword = async (password) => await hash(password, await genSalt(saltRounds))
exports.comparePassword = async (password, hashedPassword) => await compare(password, hashedPassword)
