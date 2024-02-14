'use strict';
const { DataTypes: DT, Model } = require('sequelize');
const { generateId } = require('../../libs/ulid')
module.exports = (sequelize, DataTypes = DT) => {
  class Wallet extends Model {
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

      this.hasMany(models.Transaction, {
        foreignKey: 'walletId',
        as: 'transactions'
      })
    }
  }
  Wallet.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING(26),
      defaultValue: generateId,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    balance: {
      allowNull: false,
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
  }, {
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    modelName: 'Wallet',
    paranoid: true,
    sequelize,
    tableName: 'wallets',
  });
  return Wallet;
};