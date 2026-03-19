import assert from 'node:assert';
import crypto from 'crypto';
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

// Set up test details for a specific Schedule entry.
const testId = 1;
const testIdMorning = 2;
const testIdAfternoon = 3;
const testName = 'Julia';
const testDate = new Date('2026-03-03');
const testNewName = 'Koos';
const testPassword = 'Password';
const testSalt = 'salty';

let testSchedule = [
  {
    date: testDate,
  },
  {
    date: new Date('2026-03-04'),
  },
  {
    date: new Date('2026-03-09'),
  },
  {
    date: new Date('2026-03-10'),
  },
  {
    date: new Date('2026-04-05'),
  },
];

let testVolunteers = [
  {
    name: testName,
  },
  {
    name: 'Kees',
  },
  {
    name: 'Frank',
  },
];

const hash = crypto.createHash('sha256');

let testUsers = [
  {
    username: 'Kees',
    passwordHash: hash.update(testPassword + testSalt).digest('base64'),
    passwordSalt: testSalt
  },
]

describe('DatabaseHandler', () => {
  before(async() => {
    await databaseHandler.sync();
  });

  beforeEach(async () => {
    // Clean the used models before each test.
//    await databaseHandler.models.Schedule.destroy({ truncate: true, restartIdentity: true });
//    await databaseHandler.models.Volunteer.destroy({ truncate: true, restartIdentity:true });
//    await databaseHandler.models.User.destroy({ truncate: true, restartIdentity: true });
    await sequelize.truncate();
    await sequelize.query('DELETE FROM sqlite_sequence');

    // Insert test data and use first volunteer id for tests.
    const volunteers = await databaseHandler.models.Volunteer.bulkCreate(testVolunteers);

    testSchedule.forEach(entry => {
      entry.morningId = testIdMorning;
      entry.afternoonId = testIdAfternoon;
    });
    
    await databaseHandler.models.Schedule.bulkCreate(testSchedule);
    await databaseHandler.models.User.bulkCreate(testUsers);
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

    describe(':getScheduleForWeek', () => {
      it('should return the schedule for a given week', async () => {
        const expectedResult = [testSchedule[2], testSchedule[3]];
        const result = await databaseHandler.getScheduleForWeek(11);

        assert.equal(result.entries.length, expectedResult.length);

        for(let i = 0; i < expectedResult.length; i++) {
          assert.equal(result.entries[i].date.valueOf(), expectedResult[i].date.valueOf());
        }
      })
    })
      
    describe(':addScheduleEntry', () => {
      it('should add a new schedule entry', async () => {
        const insertedDate = new Date('2026-04-10');
        await databaseHandler.addScheduleEntry(insertedDate, { morning: testIdMorning, afternoon: testIdAfternoon});
        const result = await databaseHandler.models.Schedule.findAll({ where: { date: insertedDate }});

        assert.equal(result[0].date.valueOf(), insertedDate.valueOf());
        assert.equal(result[0].morningId, testIdMorning);
        assert.equal(result[0].afternoonId, testIdAfternoon);
      });
    });

    describe(':updateScheduleEntry', () => {
      it('should update the volunteer on an existing schedule entry', async () => {
        await databaseHandler.updateScheduleEntry(testDate, { morning: testId });
        const result = await databaseHandler.models.Schedule.findAll({ where: { date: testDate }});

        assert.equal(result[0].morningId, testId);
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

  describe(':User', () => {
    describe(':verifyLogin', () => {
      it('should accept a login attempt with correct details', async () => {
        const success = await databaseHandler.verifyLogin(testUsers[0].username, testPassword);
        
        assert.equal(success, true);
      });

      it('should reject an invalid login attempt', async () => {
        const success = await databaseHandler.verifyLogin(testName, 'FAKE PASSWORD');
        
        assert.equal(success, false);
      });
    });

    describe.skip(':addUser', () => {
      it('should add a user with the given details', async () => {
        const success = await databaseHandler.addUser(testName, testPassword);

        assert.equal(success, true);
      });
    });

    describe.skip(':removeUser', () => {
      it('should remove a user with the given details', async () => {
        const success = await databaseHandler.removeUser(testName);

        assert.equal(success, true);
      });
    });
  });
});
