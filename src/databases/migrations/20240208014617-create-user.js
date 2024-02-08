'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()
		try {
			await queryInterface.createTable('users', {
				id: {
					allowNull: false,
					primaryKey: true,
					type: Sequelize.STRING(26),
				},
				email: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
				},
				password: {
					allowNull: false,
					type: Sequelize.TEXT,
				},
				name: {
					allowNull: false,
					type: Sequelize.STRING,
				},
				createdAt: {
					allowNull: false,
					type: Sequelize.DATE,
				},
				updatedAt: {
					allowNull: false,
					type: Sequelize.DATE,
				},
				deletedAt: {
					allowNull: true,
					type: Sequelize.DATE,
				},
			}, { transaction })

			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction()

		try {
			await queryInterface.dropTable('users', { transaction })
			await transaction.commit()
		} catch (error) {
			await transaction.rollback()
			throw error
		}
	},
}