import userSchema from './models/user.js';
import volunteerSchema from './models/volunteer.js';
import scheduleSchema from './models/schedule.js';

export default class DatabaseHandler {
  constructor(mongoose) {
    // Initialize and add all models to an object for easy access.
    this.models = {
      User: mongoose.model('User', userSchema(mongoose)),
      Volunteer: mongoose.model('Volunteer', volunteerSchema(mongoose)),
      Schedule: mongoose.model('Schedule', scheduleSchema(mongoose)),
    };
  }

  // TODO write function that collects all schedule entries in the week of the given date.
  async getScheduleForDateRange(startDate, endDate) {
    return this.models.Schedule.find({ 
      date: {
        $gte: startDate,
        $lte: endDate
      } 
    });
  }

  async addScheduleEntry(date, partOfDay, volunteerName) {
    return this.models.Schedule.insertOne({ date: date, part_of_day: partOfDay, volunteer_name: volunteerName });
  }
  
  // Retrieve a list of all volunteers.
  async getVolunteerNames() {
    const volunteers = await this.models.Volunteer.find({});
    const volunteerNames = [];
    
    volunteers.forEach((volunteer) => volunteerNames.push(volunteer.name));
    return volunteerNames;
  }

  async addVolunteer(name) {
    return this.models.Volunteer.insertOne({ name: name });
  }

  async removeVolunteer(name) {
    return this.models.Volunteer.deleteOne({ name: name });
  }

  async updateVolunteer(old_name, new_name) {
    return this.models.Volunteer.findOneAndUpdate({ name: old_name }, { name: new_name });
  }
}
  // Unsure if even needed. StartDate + EndDate could be enough and doing the calculation in the class requesting the data.
  //getStartOfWeek(date) {
  //  const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
  //  return new Date(date - (date.getDay() * MILLISECONDS_PER_DAY));
  //}

