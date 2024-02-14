'use strict'
const { TRANSACTION_TYPES } = require('../../libs/constant')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			await queryInterface.createTable('transactions', {
				id: {
					allowNull: false,
					primaryKey: true,
					type: Sequelize.STRING(26),
				},
				userId: {
					allowNull: false,
					type: Sequelize.STRING(26),
					references: {
						model: {
							tableName: 'users',
						},
						key: 'id',
					},
				},
				categoryId: {
					allowNull: false,
					type: Sequelize.STRING(26),
					references: {
						model: {
							tableName: 'categories',
						},
						key: 'id',
					},
				},
				walletId: {
					allowNull: false,
					type: Sequelize.STRING(26),
					references: {
						model: {
							tableName: 'wallets',
						},
						key: 'id',
					},
				},
				description: {
					allowNull: true,
					type: Sequelize.TEXT,
				},
				type: {
					allowNull: false,
					type: Sequelize.ENUM(...Object.values(TRANSACTION_TYPES)),
					defaultValue: TRANSACTION_TYPES.EXPENSE,
				},
				amount: {
					allowNull: false,
					type: Sequelize.BIGINT,
				},
				timestamp: {
					allowNull: false,
					type: Sequelize.BIGINT,
					defaultValue: Date.now()
				},
				deletedAt: {
					allowNull: true,
					type: Sequelize.DATE,
				},
			}, { transaction })
			await queryInterface.addIndex('transactions', ['timestamp'], { transaction })

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('transactions')
	},
}