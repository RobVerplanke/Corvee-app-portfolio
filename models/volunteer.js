import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Volunteer = sequelize.define('Volunteer',
  {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    }
  });
  return Volunteer;
};
