import assert from 'node:assert';
import Sequelize from 'sequelize';
import DatabaseHandler from '../databaseHandler.js';
import Sqlite3 from '@vscode/sqlite3';
Sqlite3.verbose();

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: Sqlite3,
  storage: ':memory:',
});
const databaseHandler = new DatabaseHandler(sequelize);
// TODO: Sync is async, could cause problems in the constructor but not sure where to use. It creates tables if they don't exist.
await sequelize.sync();

const testSchedule = [
  {
    date: new Date('2026-03-03'),
    partOfDay: 'Afternoon',
    volunteerName: 'Julia',
  },
  {
    date: new Date('2026-03-04'),
    partOfDay: 'Morning',
    volunteerName: 'Kees',
  },
  {
    date: new Date('2026-04-05'),
    partOfDay: 'Morning',
    volunteerName: 'Frank',
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
    await databaseHandler.models.Schedule.destroy({ truncate: true });
    await databaseHandler.models.Volunteer.destroy({ truncate: true });
  });

  describe(':getScheduleForDateRange', () => {
    beforeEach(async () => {
      // Insert schedule data.
      await databaseHandler.models.Schedule.bulkCreate(testSchedule);
    });

    it('should return the date entries for the given date range.', async () => {
      const expectedResult = [testSchedule[0], testSchedule[1]];
      const result = await databaseHandler.getScheduleForDateRange(new Date('2026-03-03'), new Date('2026-03-05'));
      
      assert.equal(result[0].date.valueOf(), expectedResult[0].date.valueOf());
      assert.equal(result[1].date.valueOf(), expectedResult[1].date.valueOf());
    });
  });
    
  describe(':addScheduleEntry', () => {
    it('should add a new schedule entry', async () => {
      await databaseHandler.addScheduleEntry(new Date('2026-03-10'), 'Afternoon', 'Henk');
      const result = await databaseHandler.models.Schedule.findAll({ where: { date: new Date('2026-03-10') }});

      assert.equal(result[0].date.valueOf(), new Date('2026-03-10').valueOf());
    });
  });
  
  describe(':getVolunteers', () => {
    beforeEach(async () => {
      // Insert volunteer data.
      await databaseHandler.models.Volunteer.bulkCreate(testVolunteers);
    });

    it('should return all the volunteer names.', async () => {
      const expectedResult = testVolunteers;
      const result = await databaseHandler.getVolunteerNames();

      for (let i = 0; i < result.length; i++) {
        assert.equal(result[i].name, expectedResult[i].name);
      }
    });
  });
  
  describe(':addVolunteer', () => {
    it('should add a given volunteer.', async () => {
      await databaseHandler.addVolunteer('Henk');
      const result = await databaseHandler.models.Volunteer.findAll({ where: { name: 'Henk' }});
      
      assert.equal(result[0].name, 'Henk');
    });
  });

  describe(':removeVolunteer', () => {
    it('should remove a given volunteer', async () => {
      await databaseHandler.removeVolunteer('Frank');
      const result = await databaseHandler.models.Volunteer.findAll({ where: { name: 'Frank' }});

      assert.equal(result.length, 0);
    });
  });

  describe(':updateVolunteer', () => {
    beforeEach(async () => {
      // Insert volunteer data.
      await databaseHandler.models.Volunteer.bulkCreate(testVolunteers);
    });

    it('should update a given volunteer name to the new name', async () => {
      await databaseHandler.updateVolunteer('Kees', 'Koos');
      const result = await databaseHandler.models.Volunteer.findAll({ where: { name: 'Koos' }});

      assert.equal(result.length, 1);
    });
  });

  after(() => {
    databaseHandler.closeConnection();
  });
});
