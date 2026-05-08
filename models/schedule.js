import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Schedule = sequelize.define('Schedule',
  {
    date: {
      type: DataTypes.DATE,
      unique: true,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  });
  return Schedule;
};
