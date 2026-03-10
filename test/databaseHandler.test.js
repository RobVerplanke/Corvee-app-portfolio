import assert from 'node:assert';
import mongoose from 'mongoose';
import DatabaseHandler from '../databaseHandler.js';

mongoose.connect('mongodb://127.0.0.1:27017/test');
const databaseHandler = new DatabaseHandler(mongoose);

const testSchedule = [
  {
    date: new Date('2026-03-03'),
    part_of_day: 'Afternoon',
    volunteer_name: 'Julia',
  },
  {
    date: new Date('2026-03-04'),
    part_of_day: 'Morning',
    volunteer_name: 'Kees',
  },
  {
    date: new Date('2026-04-05'),
    part_of_day: 'Morning',
    volunteer_name: 'Frank',
  },
];

const testVolunteers = [
  {
    name: 'Julia',
  },
  {
    name: 'Kees',
  },
  {
    name: 'Frank',
  },
]

describe('DatabaseHandler', () => {
  beforeEach(async () => {
    // Clean the used models before each test.
    await databaseHandler.models.Schedule.deleteMany({});
    await databaseHandler.models.Volunteer.deleteMany({});
  });

  describe(':addScheduleEntry', () => {
    it('should add a new schedule entry', async () => {
      await databaseHandler.addScheduleEntry(new Date('2026-03-10'), 'Afternoon', 'Henk');
      const result = await databaseHandler.models.Schedule.find({ date: new Date('2026-03-10') });

      assert.equal(result[0].date.valueOf(), new Date('2026-03-10').valueOf());
    });
  });

  describe(':getScheduleForDateRange', () => {
    beforeEach(async () => {
      // Insert schedule data.
      await databaseHandler.models.Schedule.insertMany(testSchedule);
    });

    it('should return the date entries for the given date range.', async () => {
      const expectedResult = [testSchedule[0], testSchedule[1]];
      const result = await databaseHandler.getScheduleForDateRange(new Date('2026-03-03'), new Date('2026-03-05'));

      assert.equal(result[0].date.valueOf(), expectedResult[0].date.valueOf());
      assert.equal(result[1].date.valueOf(), expectedResult[1].date.valueOf());
    });
  });
  
  describe(':getVolunteers', () => {
    beforeEach(async () => {
      // Insert volunteer data.
      await databaseHandler.models.Volunteer.insertMany(testVolunteers);
    });

    it('should return all the volunteer names.', async () => {
      const expectedResult = testVolunteers;
      const result = await databaseHandler.getVolunteerNames();

      for (let i = 0; i < result.length; i++) {
        assert.equal(result[i], expectedResult[i].name);
      }
    });
  });
  
  describe(':addVolunteer', () => {
    it('should add a given volunteer.', async () => {
      await databaseHandler.addVolunteer('Henk');
      const result = await databaseHandler.models.Volunteer.find({ name: 'Henk' });
      
      assert.equal(result[0].name, 'Henk');
    })
  })
});
