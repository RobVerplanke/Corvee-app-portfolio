import Sequelize from 'sequelize';
import Sqlite3 from '@vscode/sqlite3';
import DatabaseHandler from './databaseHandler.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: Sqlite3,
  storage: 'database.sqlite',
});

const databaseHandler = new DatabaseHandler(sequelize);
await databaseHandler.sync();

// Clean the database before adding the test data.
await sequelize.truncate();
await sequelize.query('DELETE FROM sqlite_sequence');

const testVolunteers = [
  {
    name: "Harry"
  },
  {
    name: "Corrie"
  },
  {
    name: "Jan"
  },
  { 
    name: "Annie"
  },
  {
    name: "Truus"
  },
  {
    name: "Henk"
  },
  {
    name: "Jan"
  },
  {
    name: "Miep"
  },
  {
    name: "Edje",
  }
]

const volunteers = await databaseHandler.models.Volunteer.bulkCreate(testVolunteers);
console.log(volunteers[0]);

const testSchedules = [
  // Week 1
  {
    date: new Date("2026-02-02"),
    morningId: volunteers[0].id,
    afternoonId: volunteers[1].id,
  },
  {
    date: new Date("2026-02-03"),
    morningId: volunteers[2].id,
    afternoonId: volunteers[3].id,
  },
  {
    date: new Date("2026-02-04"),
    morningId: volunteers[4].id,
    afternoonId: volunteers[5].id,
  },
  {
    date: new Date("2026-02-05"),
    morningId: volunteers[6].id,
    afternoonId: volunteers[0].id,
  },
  {
    date: new Date("2026-02-06"),
    morningId: volunteers[7].id,
    afternoonId: volunteers[8].id,
  },
  // Week 2
  {
    date: new Date("2026-02-09"),
    morningId: volunteers[0].id,
    afternoonId: volunteers[1].id,
  },
  {
    date: new Date("2026-02-10"),
    morningId: volunteers[2].id,
    afternoonId: volunteers[3].id,
  },
  {
    date: new Date("2026-02-11"),
    morningId: volunteers[4].id,
    afternoonId: volunteers[5].id,
  },
  {
    date: new Date("2026-02-12"),
    morningId: volunteers[6].id,
    afternoonId: volunteers[0].id,
  },
  {
    date: new Date("2026-02-13"),
    morningId: volunteers[7].id,
    afternoonId: volunteers[8].id,
  },
  // Week 3
  {
    date: new Date("2026-02-16"),
    morningId: volunteers[0].id,
    afternoonId: volunteers[1].id,
  },
  {
    date: new Date("2026-02-17"),
    morningId: volunteers[2].id,
    afternoonId: volunteers[3].id,
  },
  {
    date: new Date("2026-02-18"),
    morningId: volunteers[4].id,
    afternoonId: volunteers[5].id,
  },
  {
    date: new Date("2026-02-19"),
    morningId: volunteers[6].id,
    afternoonId: volunteers[0].id,
  },
  {
    date: new Date("2026-02-20"),
    morningId: volunteers[7].id,
    afternoonId: volunteers[8].id,
  },
  // Week 4
  {
    date: new Date("2026-02-23"),
    morningId: volunteers[0].id,
    afternoonId: volunteers[1].id,
  },
  {
    date: new Date("2026-02-24"),
    morningId: volunteers[2].id,
    afternoonId: volunteers[3].id,
  },
  {
    date: new Date("2026-02-25"),
    morningId: volunteers[4].id,
    afternoonId: volunteers[5].id,
  },
  {
    date: new Date("2026-02-26"),
    morningId: volunteers[6].id,
    afternoonId: volunteers[0].id,
  },
  {
    date: new Date("2026-02-27"),
    morningId: volunteers[7].id,
    afternoonId: volunteers[8].id,
  }
];

await databaseHandler.models.Schedule.bulkCreate(testSchedules);
console.log("Test data added.");

