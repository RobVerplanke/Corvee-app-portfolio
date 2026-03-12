import { Op } from 'sequelize';
import userModel from './models/user.js';
import volunteerModel from './models/volunteer.js';
import scheduleModel from './models/schedule.js';

export default class DatabaseHandler {
  constructor(sequelize) {
    this.sequelize = sequelize;

    // Initialize and add all models to an object for easy access.
    this.models = {
      User: userModel(this.sequelize),
      Volunteer: volunteerModel(this.sequelize),
      Schedule: scheduleModel(this.sequelize),
    };

    // Set up relations.
    this.models.Schedule.hasOne(this.models.Volunteer);
  }

  closeConnection() {
    this.sequelize.close();
  }

  async getScheduleForDateRange(startDate, endDate) {
    return this.models.Schedule.findAll({ 
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      } 
    });
  }

  async addScheduleEntry(date, partOfDay, volunteerName) {
    return this.models.Schedule.create({ date: date, partOfDay: partOfDay, volunteerName: volunteerName });
  }
  
  async getVolunteerNames() {
    return this.models.Volunteer.findAll({ attributes: ['name'] });
  }

  async addVolunteer(name) {
    return this.models.Volunteer.create({ name: name });
  }

  async removeVolunteer(name) {
    return this.models.Volunteer.destroy({ where: { name: name } });
  }

  async updateVolunteer(old_name, new_name) {
    return this.models.Volunteer.update({ name: new_name }, { where: { name: old_name }});
  }
}
