import { getWeekNumber, getNameOfDay, formatDate } from './helpers.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import Sqlite3 from '@vscode/sqlite3';
import DatabaseHandler from './databaseHandler.js';
//import toggleCard from './script/dashboard/dashboard.js'; // WERKT NIET

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: Sqlite3,
  storage: 'database.sqlite',
  logging: false,
});
const databaseHandler = new DatabaseHandler(sequelize);
// TODO: Find out if synchronization can be done in a better way.
await databaseHandler.sync();

// Use static files for CSS-styling, scripts and assets (images)
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to ejs and build an absolute path to the views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Login page
app.get('/', (req, res) => {
  res.render('pages/index');
});

// Agenda page - Extra span-elements are used for the printed version
app.get('/agenda', async (req, res) => {

  // TODO: Add data to database to test if the data is forwarded correctly

  const MONTHS = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const SCHEDULES_PER_MONTH = 4;

  let schedules = [];
  let weekNumbers = [];
  let today = new Date();
  let currentDate = new Date(today); // Create copy to avoid mutation of the original date
  let currentWeekNumber = getWeekNumber(currentDate); // Get current week number
  let currentMonthName = MONTHS[currentDate.getMonth()]; // Get current month name
  
  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for(let i=0; i<SCHEDULES_PER_MONTH; i++) {
    schedules.push(await databaseHandler.getScheduleForWeek(currentWeekNumber+i));
    weekNumbers.push(currentWeekNumber+i);
  }
  
  // Helper functions that are needed in the agenda view
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
    weekNumbers: weekNumbers,
  }

  // The activePage function is day to highlight the corresponding navigation button of the active page
  res.render('pages/agenda', { activePage: 'agenda', currentMonthName: currentMonthName, schedules: schedules, helper: helper });
});

// Admin dashboard page
app.get('/dashboard', (req, res) => {
  res.render('pages/dashboard', { activePage: 'dashboard' });
});

// Instructions manual page
app.get('/manual', (req, res) => {
  res.render('pages/manual', { activePage: 'manual'});
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});