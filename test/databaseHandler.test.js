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

let testSchedule = [
  {
    date: new Date('2026-03-03'),
    partOfDay: 'Afternoon',
  },
  {
    date: new Date('2026-03-04'),
    partOfDay: 'Morning',
  },
  {
    date: new Date('2026-04-05'),
    partOfDay: 'Morning',
  },
];

let testVolunteers = [
  {
    name: 'Julia',
  },
  {
    name: 'Kees',
  },
  {
    name: 'Frank',
  },
];

// Set up test details for a specific Schedule entry.
let testId = 0;
let testName = '';
let testDate = testSchedule[0].date;
let testPartOfDay = testSchedule[0].partOfDay;
const testNewName = 'Koos';

describe('DatabaseHandler', () => {
  beforeEach(async () => {
    // Clean the used models before each test.
    await databaseHandler.models.Schedule.destroy({ truncate: true });
    await databaseHandler.models.Volunteer.destroy({ truncate: true });
    
    // Insert test data and use first volunteer id for tests.
    const result = await databaseHandler.models.Volunteer.bulkCreate(testVolunteers);
    testId = result[0].id;
    testName = result[0].name;

    testSchedule.forEach(entry => {
      entry.VolunteerId = testId;
    });
    
    await databaseHandler.models.Schedule.bulkCreate(testSchedule);
  });
  
  describe(':Schedule', () => {
    describe(':getScheduleForDateRange', () => {
      it('should return the date entries for the given date range.', async () => {
        const expectedResult = [testSchedule[0], testSchedule[1]];
        const result = await databaseHandler.getScheduleForDateRange(new Date('2026-03-03'), new Date('2026-03-05'));
        
        assert.equal(result[0].date.valueOf(), expectedResult[0].date.valueOf());
        assert.equal(result[1].date.valueOf(), expectedResult[1].date.valueOf());
      });
    });
      
    describe(':addScheduleEntry', () => {
      it('should add a new schedule entry', async () => {
        const insertedDate = new Date('2026-03-10');
        await databaseHandler.addScheduleEntry(insertedDate, testPartOfDay, testId);
        const result = await databaseHandler.models.Schedule.findAll({ where: { date: insertedDate }});

        assert.equal(result[0].date.valueOf(), insertedDate.valueOf());
        assert.equal(result[0].VolunteerId, testId);
      });
    });

    describe(':updateScheduleEntry', () => {
      it('should update the volunteer on an existing schedule entry', async () => {
        const updatedVolunteer = await databaseHandler.models.Volunteer.findOne({ where: { name: testVolunteers[1].name }});
        await databaseHandler.updateScheduleEntry(testDate, testPartOfDay, updatedVolunteer.id);
        const result = await databaseHandler.models.Schedule.findAll({ where: { date: testDate, partOfDay: testPartOfDay }});

        assert.equal(result[0].VolunteerId, updatedVolunteer.id);
      });
    });
  });
  
  describe(':Volunteer', () => {
    describe(':getVolunteers', () => {
      it('should return all the volunteers.', async () => {
        const expectedResult = testVolunteers;
        const result = await databaseHandler.getVolunteers();

        for (let i = 0; i < result.length; i++) {
          assert.equal(result[i].name, expectedResult[i].name);
        }
      });
    });
    
    describe(':addVolunteer', () => {
      it('should add a given volunteer.', async () => {
        let insertedVolunteer = await databaseHandler.addVolunteer('Henk');
        const result = await databaseHandler.models.Volunteer.findAll({ where: { id: insertedVolunteer.id }});
        
        assert.equal(result[0].id, insertedVolunteer.id);
        assert.equal(result[0].name, insertedVolunteer.name);
      });
    });

    describe(':removeVolunteer', () => {
      it('should remove a given volunteer', async () => {
        await databaseHandler.removeVolunteer(testId);
        const result = await databaseHandler.models.Volunteer.findAll({ where: { id: testId }});

        assert.equal(result.length, 0);
      });
    });

    describe(':updateVolunteer', () => {
      it('should update a given volunteer name to the new name', async () => {
        await databaseHandler.updateVolunteer(testId, testNewName);
        const result = await databaseHandler.models.Volunteer.findAll({ where: { id: testId }});

        assert.equal(result[0].id, testId);
        assert.equal(result[0].name, testNewName);
      });
    });
  });

  after(() => {
    databaseHandler.closeConnection();
  });
});
