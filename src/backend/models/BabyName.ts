import { DataTypes } from "sequelize";
import { sequelize } from "../helpers/database";

export const BabyName = sequelize.define('BabyName', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true },
  year: DataTypes.STRING,
  name: DataTypes.STRING,
  sex: DataTypes.STRING,
  number: DataTypes.BIGINT.UNSIGNED,
  synchronized: DataTypes.BOOLEAN
}, {
  tableName: "baby_name"
});