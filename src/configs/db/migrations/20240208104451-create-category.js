'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			await queryInterface.createTable('categories', {
				id: {
					allowNull: false,
					primaryKey: true,
					type: Sequelize.STRING(26),
				},
				name: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
				},
				slug: {
					allowNull: false,
					type: Sequelize.STRING,
					unique: true,
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
			})
		} catch (error) {
			throw error
		}
	},
	async down(queryInterface, Sequelize) {
		try {
			await queryInterface.dropTable('categories')
		} catch (error) {
			throw error
		}
	},
}