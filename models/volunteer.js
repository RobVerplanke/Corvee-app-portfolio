import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Volunteer = sequelize.define('Volunteer',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  return Volunteer;
};
