require('dotenv').config()
const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DIALECT = 'mysql' } = process.env

exports.development = {
	username: DB_USER,
	password: DB_PASSWORD ?? null,
	database: DB_NAME,
	host: DB_HOST,
	port: DB_PORT,
	dialect: DB_DIALECT,
}
exports.test = {
	username: DB_USER,
	password: DB_PASSWORD ?? null,
	database: DB_NAME,
	host: DB_HOST,
	port: DB_PORT,
	dialect: DB_DIALECT,
}
exports.production = {
	username: DB_USER,
	password: DB_PASSWORD ?? null,
	database: DB_NAME,
	host: DB_HOST,
	port: DB_PORT,
	dialect: DB_DIALECT,
	logging: false,
}
