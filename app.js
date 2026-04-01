import { getWeekNumber, getNameOfDay, formatDate, getMostCommonMonth, getAutoFillSchedule } from './helpers.js';
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

  // Used for the convertion of month numbers to month names
  const MONTHS = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const SCHEDULES_PER_MONTH = 4; // Amount of schedules displayed per month
  const DAYS_PER_WEEK = 5;

  let schedules = [];
  let weekNumbers = [];
  let today = new Date(); // Get current date
  let currentDate = new Date(today); // Create copy to avoid mutation of the original date
  let currentWeekNumber = getWeekNumber(currentDate); // Get current week number
  let mostCommonMonth = ''; // Most common month, becomes the page title
 
  // Placeholder data for an empty day, in case there is no data available
  const emptyDay = {
    date: '',
    morning: { name: '-' },
    afternoon: { name: '-' }
  }
  
  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i=0; i<SCHEDULES_PER_MONTH; i++) {
    schedules.push(await databaseHandler.getScheduleForWeek(currentWeekNumber+i));
    weekNumbers.push(currentWeekNumber+i);
  }

  // Determine what is the most common month name in the schedules so it can be uses as page title
  mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];
  
  // When the schedule is missing data for one or more days, add placeholder content for the missing days
  const autoFilledSchedule = schedules.map(schedule => {
    while (schedule.length < DAYS_PER_WEEK) {
      schedule.push(emptyDay);
    }
    return schedule;
  });

  // Functions and data which are needed to display titles and dates in the agenda view
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
    weekNumbers: weekNumbers,
  }
  
  // activePage - function that highlights the corresponding navigation button of the active page
  // currentMonthName - used as the page title
  // schedules - contains all table data
  // helper - contains functions and weeknumbers to correctly display the data
  res.render('pages/agenda', { activePage: 'agenda', currentMonthName: mostCommonMonth, schedules: autoFilledSchedule, helper: helper });
});

// Admin dashboard page
app.get('/dashboard', async (req, res) => {

  // TODO: Save and send selection of names to db after submit (volunteer id's)
  
  // Used for the convertion of month numbers to month names
  const MONTHS = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const SCHEDULES_PER_MONTH = 4; // Amount of schedules displayed per month
  const DAYS_PER_WEEK = 5;

  let schedules = [];
  let autoFilledSchedule = [];
  let weekNumbers = [];
  let today = new Date(); // Get current date
  let currentDate = new Date(today); // Create copy to avoid mutation of the original date
  let currentWeekNumber = getWeekNumber(currentDate); // Get current week number
  let volunteers = await databaseHandler.getVolunteers(); // Get all volunteer names
  let mostCommonMonth = ''; // Most common month, becomes the page title
  
  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i=0; i<SCHEDULES_PER_MONTH; i++) {
    schedules.push(await databaseHandler.getScheduleForWeek(currentWeekNumber+i));
    weekNumbers.push(currentWeekNumber+i); // Corresponding weeknumbers will be used as table titles
  }

  // Determine what is the most common month name in the schedules so it can be uses as page title
  mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];

  // When the schedule is missing data for one or more days, calculate dates for the missing days
  autoFilledSchedule = getAutoFillSchedule(schedules, weekNumbers, DAYS_PER_WEEK);

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
  // currentMonthName - used as the page title
  // schedules - contains all table data
  // helper - contains functions and data to display corresponding content
  res.render('pages/dashboard', { activePage: 'dashboard', helper: helper, data: data });
});

// Instructions manual page
app.get('/manual', (req, res) => {
  res.render('pages/manual', { activePage: 'manual'});
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});