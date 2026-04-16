/** @module databaseHandler **/ 
import { Op } from 'sequelize';
import crypto from 'crypto';
import { getWeekNumber, getMondayFromWeekNumber } from './helpers.js'
import userModel from './models/user.js';
import volunteerModel from './models/volunteer.js';
import scheduleModel from './models/schedule.js';

/**
 * @typedef module:databaseHandler.Day
 * @type {Object}
 * @property {Date} date Date of the day.
 * @property {Model} morning The instance of the volunteer for the morning shift.
 * @property {Model} afternoon The instance of the volunteer for the afternoon shift.
 */

/** 
 * Wraps around the sequelize instance to provide a layer between the app and the database.
 * @class DatabaseHandler
 * @type {Object}
 *
 * @param {Sequelize} sequelize - The instance of sequelize to wrap around. 
 * @property {Sequelize} sequelize The instance of sequelize passed in the constructor.
 * @property {Object} models An object containing the various registered models.
 * @property {Model} models.User The User model.
 * @property {Model} models.Volunteer The Volunteer model.
 * @property {Model} models.Schedule The Schedule model.
 */
class DatabaseHandler {
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

  /**
   * Synronizes the models with the existing tables, creates new tables if not existing.
   * Simply passes the request on to sequelize.
   *
   * @returns {Promise} The promise received from sequelize.
   */
  async sync() {
    return this.sequelize.sync();
  }

  /**
   * Retrieves the schedule for the requested date range.
   *
   * @param {Date} startDate - The start of the data range (inclusive)
   * @param {Date} endDate - The end of the data range (inclusive)
   *
   * @returns {Promise<Model[]>} The promise made by sequelize which will resolve to the found array of data.
   */
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

  /**
   * Retrieves the schedule for the requested week using the ISO 8601 format.
   * The result is specifically for display on the agenda page.
   * 
   * @param {number} - The requested week number.
   *
   * @returns {module:databaseHandler.Day[]} week - The requested week data as an array of Day data.
   */
  async getScheduleForWeek(weekNr) {
    // Get the start date from the weekNr.
    const startDate = getMondayFromWeekNumber(weekNr);

    // Get the end date by adding 5 days to equal Saturday since timezones mess up things.
    const endDate = new Date(startDate.valueOf());
    endDate.setDate(endDate.getDate() + 5);
    const retrievedSchedule = await this.models.Schedule.findAll({
      where: {
        date: {
          [Op.gte]: startDate,
          [Op.lte]: endDate,
        }
      }
    });
    
    let week = [];

    for (var i = 0; i < retrievedSchedule.length; i++) {
      // Create an entry for this day.
      week.push({
        date: retrievedSchedule[i].date,
        morning: await retrievedSchedule[i].getMorning(),
        afternoon: await retrievedSchedule[i].getAfternoon(),
      });
    }
    return week;
  }

  /**
   * Adds a new schedule entry to the database.
   *
   * @param {Date} data - The date to be added to the database.
   * @param {Object} volunteerData - The data for the volunteer slots.
   * @param {number} volunteerData.morning - The id of the volunteer to be associated with the morning shift.
   * @param {number} volunteerData.afternoon - The id of the volunteer to be associated with the afternoon shift.
   *
   * @returns {Promise<Model>} - The promise made by sequelize with the newly created object on success.
   */
  async addScheduleEntry(date, volunteerData) {
    const morning = volunteerData.morning && volunteerData.morning != '' ? volunteerData.morning : null;
    const afternoon = volunteerData.afternoon && volunteerData.afternoon != '' ? volunteerData.afternoon : null;

    return this.models.Schedule.create({ date: date, morningId: morning, afternoonId: afternoon });
  }

  /**
   * Updates an entry in the schedules table.
   *
   * @param {Date} date - The date to change data of.
   * @param {Object} changedData - The data to be changed.
   * @param {number} changedData.morning - The id of the volunteer to replace the current morning id with.
   * @param {number} changedData.afternoon - The id of the volunteer to replace the current afternoon id with.
   *
   * @returns {Promise<number[]>} - The promise made by sequelize with the affected rows as result.
   * @throws Will throw an error when a schedule entry does not exist for the given date.
   */
  async updateScheduleEntry(date, changedData) {
    if (changedData.afternoon == undefined && changedData.morning == undefined) {
      console.log("Both afternoon or morning are undefined");
      return null;
    }

    // Find whether a record with the date already exists.
    const scheduleEntry = await this.models.Schedule.findAll({
      where: {
        date: date
      }
    });

    if (scheduleEntry.length == 0) {
      // No entries found, throw error so caller can potentially add the record instead.
      throw new Error("No schedule entries found for date: " + date.toDateString());
    }

    // Set the query options depending on the changedData.
    let queryOptions = {};
    queryOptions.morningId = changedData.morning == '' ? null : changedData.morning;
    queryOptions.afternoonId = changedData.afternoon == '' ? null : changedData.afternoon;
    return this.models.Schedule.update(queryOptions, { where: { date: date }});
  }
  
  /**
   * Retrieves all volunteers in the database table.
   *
   * @returns {Promise<Model[]>} - The promise made by sequelize resulting in an array with all volunteers.
   */
  async getVolunteers() {
    return this.models.Volunteer.findAll();
  }

  /**
   * Adds a new volunteer to the database.
   *
   * @param {string} name - The name of the new volunteer.
   *
   * @returns {Promise<Model>} - The promise made by sequelize with the newly created object on success.
   */
  async addVolunteer(name) {
    let volunteerName = name.toLowerCase();
    return this.models.Volunteer.create({ name: volunteerName });
  }

  /**
   * Removes a volunteer.
   *
   * @param {number} id - The id of the volunteer to be removed.
   * 
   * @returns {Promise<number>} - The promise made by sequelize with the number of affected rows as result.
   */
  async removeVolunteer(id) {
    return this.models.Volunteer.destroy({ where: { id: id } });
  }

  /**
   * Updates a volunteer's name.
   *
   * @param {number} id - The id of the volunteer to be renamed.
   * @param {string} new_name - The new name for the volunteer.
   * 
   * @returns {Promise<number[]>} - The promise made by sequelize with the number of affected rows as result.
   */
  async updateVolunteer(id, new_name) {
    return this.models.Volunteer.update({ name: new_name }, { where: { id: id }});
  }

  /**
   * Verifies a login attempt
   *
   * @param {string} username - The username for the login attempt.
   * @param {string} password - The password for the login attempt.
   *
   * @returns {boolean} - Whether the login attempt is successful or not.
   */
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

export default DatabaseHandler;
