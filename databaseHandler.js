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
    this.models.Volunteer.hasOne(this.models.Schedule);
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

  async addScheduleEntry(date, partOfDay, volunteerId) {
    return this.models.Schedule.create({ date: date, partOfDay: partOfDay, VolunteerId: volunteerId });
  }

  async updateScheduleEntry(date, partOfDay, volunteerId) {
    return this.models.Schedule.update({ VolunteerId: volunteerId }, { where: { date: date, partOfDay: partOfDay }});
  }
  
  async getVolunteers() {
    return this.models.Volunteer.findAll();
  }

  async addVolunteer(name) {
    return this.models.Volunteer.create({ name: name });
  }

  async removeVolunteer(id) {
    return this.models.Volunteer.destroy({ where: { id: id } });
  }

  async updateVolunteer(id, new_name) {
    return this.models.Volunteer.update({ name: new_name }, { where: { id: id }});
  }
}
