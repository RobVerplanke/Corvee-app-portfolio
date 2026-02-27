import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Volunteer = sequelize.define('Volunteer',
  {
    name: {
      type: DataTypes.String,
      allowNull: false,
    }
  });
  return Volunteer;
};
 
