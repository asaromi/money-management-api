'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			await queryInterface.removeColumn('wallets', 'balance')
		} catch (error) {
			throw error
		}
	},

	async down(queryInterface, Sequelize) {
		try {
			await queryInterface.addColumn('wallets', 'balance', {
				allowNull: false,
				type: Sequelize.BIGINT,
				defaultValue: 0,
			})
		} catch (error) {
			throw error
		}
	},
}
