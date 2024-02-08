'use strict';
const { DataTypes: DT, Model } = require('sequelize');
const { generateId } = require('../../libs/ulid')
module.exports = (sequelize, DataTypes = DT) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Category.init({
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
    slug: {
      allowNull: false,
      type: DataTypes.STRING
    },
  }, {
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    modelName: 'Category',
    paranoid: true,
    sequelize,
    tableName: 'categories',
  });
  return Category;
};