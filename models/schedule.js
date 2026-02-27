import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Schedule = sequelize.define('Schedule',
  {
    date: {
      type: DataTypes.DATETIME,
      allowNull: false,
    },
    partOfDay: {
      type: DataTypes.ENUM('Morning', 'Afternoon'),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  });
  return Schedule;
};
