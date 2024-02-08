'use strict'
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const { Sequelize } = require('sequelize')
const process = require('process')
const basename = path.basename(__filename)
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
// const User = require('./user')(sequelize, Sequelize.DataTypes)
// const Wallet = require('./wallet')(sequelize, Sequelize.DataTypes)
// db.User = User
// db.Wallet = Wallet

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db)
	}
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
