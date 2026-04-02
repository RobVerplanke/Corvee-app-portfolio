import { getWeekNumber, getNameOfDay, formatDate, getMostCommonMonth, getAutoFilledSchedule } from './helpers.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import Sqlite3 from '@vscode/sqlite3';
import DatabaseHandler from './databaseHandler.js';

const MONTHS = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
const SCHEDULES_PER_MONTH = 4; // Amount of schedules displayed per month
const DAYS_PER_WEEK = 5; // Working days

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
app.use(express.urlencoded({ extended: true })); // Read form data (sent from dashboard) correctly

// Set the view engine to ejs and build an absolute path to the views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Login page
app.get('/', (req, res) => {
  res.render('pages/index');
});

// Agenda page - Extra span-elements are used for the printed version
app.get('/agenda', async (req, res) => {

  let schedules = [];
  let weekNumbers = [];
  let today = new Date(); // Get current date
  let currentDate = new Date(today); // Create copy to avoid mutation of the original date
  let currentWeekNumber = getWeekNumber(currentDate); // Get current week number
 
  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i=0; i<SCHEDULES_PER_MONTH; i++) {
    schedules.push(await databaseHandler.getScheduleForWeek(currentWeekNumber+i));
    weekNumbers.push(currentWeekNumber+i);
  }

  // Determine what is the most common month name in the schedules so it can be uses as page title
  let mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];
  
  // When the schedule is missing data for one or more days, add placeholder content for the missing days
  let autoFilledSchedule = getAutoFilledSchedule(schedules, weekNumbers, DAYS_PER_WEEK)

  // Functions and data which are needed to display titles and dates in the agenda view
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
  }

  // Data that needs to be displayd
  const data = {
    schedules: autoFilledSchedule,
    weekNumbers: weekNumbers,
    mostCommonMonth: mostCommonMonth
  }
  
  // activePage - function that highlights the corresponding navigation button of the active page
  res.render('pages/agenda', { activePage: 'agenda', helper: helper, data: data });
});

// Admin dashboard page
app.get('/dashboard', async (req, res) => {

  // TODO: Save and send selection of names to db after submit (volunteer id's)

  let schedules = [];
  let weekNumbers = [];
  let today = new Date(); // Get current date
  let currentDate = new Date(today); // Create copy to avoid mutation of the original date
  let currentWeekNumber = getWeekNumber(currentDate); // Get current week number
  let volunteers = await databaseHandler.getVolunteers(); // Get all volunteer names
  
  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i=0; i<SCHEDULES_PER_MONTH; i++) {
    schedules.push(await databaseHandler.getScheduleForWeek(currentWeekNumber+i));
    weekNumbers.push(currentWeekNumber+i); // Corresponding weeknumbers will be used as table titles
  }

  // Determine what is the most common month name in the schedules so it can be uses as page title
  let mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];

  // When the schedule is missing data for one or more days, calculate dates for the missing days
  let autoFilledSchedule = getAutoFilledSchedule(schedules, weekNumbers, DAYS_PER_WEEK);

  // Functions which are needed to display corresponding content
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
  }

  // Data that needs to be displayd
  const data = {
    schedules: autoFilledSchedule,
    currentMonthName: mostCommonMonth,
    weekNumbers: weekNumbers,
    volunteers: volunteers
  }
  
  // activePage - function that highlights the corresponding navigation button of the active page
  res.render('pages/dashboard', { activePage: 'dashboard', helper: helper, data: data });
});

// Admin dashboard page - Save new schedule from form
app.post('/dashboard/save', async (req, res) => {
  console.log('request body: ', req.body);
  res.redirect('/dashboard');
});

// Instructions manual page
app.get('/manual', (req, res) => {
  res.render('pages/manual', { activePage: 'manual'});
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});