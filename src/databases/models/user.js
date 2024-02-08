'use strict'
const { DataTypes: DT, Model } = require('sequelize')
const { generateId } = require('../../libs/ulid')

module.exports = (sequelize, DataTypes = DT) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			// this.hasMany(models.Wallet, {
			// 	foreignKey: 'userId',
			// 	as: 'wallets'
			// })
		}
	}

	User.init({
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.STRING(26),
			defaultValue: generateId,
		},
		email: {
			allowNull: false,
			type: DataTypes.STRING,
		},
		password: {
			allowNull: false,
			type: DataTypes.TEXT,
		},
		name: {
			allowNull: false,
			type: DataTypes.STRING,
		},
	}, {
		defaultScope: {
			attributes: { exclude: ['deletedAt'] }
		},
		modelName: 'User',
		paranoid: true,
		sequelize,
		tableName: 'users',
	})
	return User
}