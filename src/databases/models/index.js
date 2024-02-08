'use strict'
require('dotenv').config()

const { Sequelize, DataTypes, Op } = require('sequelize')
const process = require('process')
const env = process.env.NODE_ENV || 'development'
const config = require('../../config/database')[env]
const db = {}

const payload = []
if (config?.use_env_variable) {
	payload.push(process.env[config.use_env_variable], config)
} else {
	payload.push(config.database, config.username, config.password, config)
}

const sequelize = new Sequelize(...payload)
// const Category = require('./category')(sequelize, DataTypes)
const User = require('./user')(sequelize, DataTypes)
// const Wallet = require('./wallet')(sequelize, Sequelize.DataTypes)
// db.Category = Category
db.User = User
// db.Wallet = Wallet

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize
db.Sequelize = Sequelize
db.Op = Op

module.exports = db
