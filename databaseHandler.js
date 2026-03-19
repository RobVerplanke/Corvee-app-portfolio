import { Op } from 'sequelize';
import crypto from 'crypto';
import { getWeekNumber, getMondayFromWeekNumber } from './helpers.js'
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
    this.models.Schedule.belongsTo(this.models.Volunteer, { as: 'morning'});
    this.models.Schedule.belongsTo(this.models.Volunteer, { as: 'afternoon'});
  }

  // Run this to make sure the models and database are syncronized.
  async sync() {
    return this.sequelize.sync();
  }

  async getScheduleForDateRange(startDate, endDate) {
    return this.models.Schedule.findAll({ 
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      },
    });
  }

  async getScheduleForWeek(weekNr) {
    // Get the start date from the weekNr.
    const startDate = getMondayFromWeekNumber(weekNr);
    // Get the end date by adding 4 days to equal Friday.
    const endDate = new Date(startDate.valueOf());
    endDate.setDate(endDate.getDate() + 4);
    const retrievedSchedule = await this.models.Schedule.findAll({
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      }
    });
    
    // Build the restructured schedule from the retrieved data.
    const restructuredSchedule = {
      weekNr: weekNr,
      entries: [],
    }

    for (var i = 0; i < retrievedSchedule.length; i++) {
      // Create an entry for this day.
      restructuredSchedule.entries[i] = {
        date: retrievedSchedule[i].date,
        morning: await retrievedSchedule[i].getMorning(),
        afternoon: await retrievedSchedule[i].getAfternoon(),
      };
    }
    console.log(restructuredSchedule);
    return restructuredSchedule;
  }

  async addScheduleEntry(date, volunteerData) {
    const morning = volunteerData.morning || null;
    const afternoon = volunteerData.afternoon || null;

    return this.models.Schedule.create({ date: date, morningId: morning, afternoonId: afternoon });
  }

  async updateScheduleEntry(date, changedData) {
    // TODO: handle changedData being incorrect.
    
    // Set the query options depending on the changedData.
    let queryOptions = {};
    if (changedData['morning'] != undefined) {
      queryOptions.morningId = changedData.morning;
    } 
    if (changedData['afternoon'] != undefined) {
      queryOptions.afternoonId = changedData.afternoon;
    }
    return this.models.Schedule.update(queryOptions, { where: { date: date }});
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

  async verifyLogin(username, password) {
    // Find the details of the requested user.
    const user = await this.models.User.findOne({ where: { username: username }});

    // If user doesn't exist, login is invalid.
    if (user === null) {
      return false;
    }

    // Hash the given password with the found salt and compare it against the stored hash.
    const hash = crypto.createHash('sha256');
    const passwordHash = hash.update(password + user.passwordSalt).digest('base64');

    return user.passwordHash == passwordHash;
  }
}
