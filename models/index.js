import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('sqlite::memory:');

import userModel from './user.js';
import volunteerModel from './volunteer.js';
import scheduleModel from './schedule.js';

// Initialize and add all models to an object for easy access.
const models = {
  User: userModel(sequelize),
  Volunteer: volunteerModel(sequelize),
  Schedule: scheduleModel(sequelize),
};

// Add relations between the models.
models.Schedule.hasOne(models.volunteereer)

export { sequelize, models }

