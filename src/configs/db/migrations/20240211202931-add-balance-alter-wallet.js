'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			await Promise.all([
				queryInterface.addColumn('wallets', 'balance', {
					allowNull: false,
					type: Sequelize.BIGINT,
					defaultValue: 0,
				}, { transaction }),
				queryInterface.addIndex('wallets', ['name'], { transaction })
			])

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			await Promise.all([
				queryInterface.removeColumn('wallets', 'balance', { transaction }),
				queryInterface.removeIndex('wallets', ['name'], { transaction }),
			])

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
}
