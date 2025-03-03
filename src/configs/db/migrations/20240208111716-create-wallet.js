'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		try {
			await queryInterface.createTable('wallets', {
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
			})
		} catch (error) {
			throw error
		}
	},
	async down(queryInterface, Sequelize) {
		try {
			await queryInterface.dropTable('wallets')
		} catch (error) {
			throw error
		}
	},
}