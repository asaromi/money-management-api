'use strict'
const { DataTypes: DT, Model } = require('sequelize')
const { generateId } = require('../../libs/ulid')
const { TRANSACTION_TYPES } = require('../../libs/constant')

module.exports = (sequelize, DataTypes = DT) => {
	class Transaction extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.User, {
				foreignKey: 'userId',
				as: 'user'
			})
			this.belongsTo(models.Wallet, {
				foreignKey: 'walletId',
				as: 'wallet'
			})
			this.belongsTo(models.Category, {
				foreignKey: 'categoryId',
				as: 'category'
			})
		}
	}

	Transaction.init({
		id: {
			allowNull: false,
			primaryKey: true,
			type: DataTypes.STRING(26),
			defaultValue: generateId,
		},
		description: {
			allowNull: true,
			type: DataTypes.TEXT
		},
		type: {
			allowNull: false,
			type: DataTypes.ENUM(...Object.values(TRANSACTION_TYPES)),
			defaultValue: TRANSACTION_TYPES.EXPENSE
		},
		amount: {
			allowNull: false,
			type: DataTypes.BIGINT
		},
		timestamp: {
			allowNull: false,
			type: DataTypes.BIGINT,
			defaultValue: Date.now()
		},
	}, {
		defaultScope: {
			attributes: { exclude: ['deletedAt'] },
		},
		modelName: 'Transaction',
		paranoid: true,
		sequelize,
		tableName: 'transactions',
		timestamps: false,
	})
	return Transaction
}