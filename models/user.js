import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User',
  {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordSalt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return User;
};
