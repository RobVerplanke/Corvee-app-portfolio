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
// Read form data (sent from dashboard) correctly
app.use(express.urlencoded({ extended: true })); 

// Set the view engine to ejs and build an absolute path to the views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Login page
app.get('/', (req, res) => {
  res.render('pages/index');
});

// Agenda page - Extra span-elements are used for the printed version
app.get('/agenda/', async (req, res) => {
  let requestedDate = null;

  // Create a RegExp to test the date for validity. If invalid, use today.
  const re = /^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]\b/;
  if (!re.test(req.query.date)) {
    requestedDate = new Date();
  } else {
    requestedDate = new Date(req.query.date);
  }
  let schedules = [];
  let weekNumbers = [];
  let currentWeekNumber = getWeekNumber(requestedDate); // Get current week number
 
  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i=0; i<SCHEDULES_PER_MONTH; i++) {
    schedules.push(await databaseHandler.getScheduleForWeek(currentWeekNumber+i));
    weekNumbers.push(currentWeekNumber+i);
  }

  // When the schedule is missing data for one or more days, add placeholder content for the missing days
  let autoFilledSchedule = getAutoFilledSchedule(schedules, weekNumbers, DAYS_PER_WEEK)

  // Determine what is the most common month name in the schedules so it can be uses as page title
  let mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];

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
  let requestedDate = null;

  // Create a RegExp to test the date for validity. If invalid, use today.
  const re = /^20[0-9]{2}-[0-1][0-9]-[0-3][0-9]\b/;
  if (!re.test(req.query.date)) {
    requestedDate = new Date();
  } else {
    requestedDate = new Date(req.query.date);
  }

  let schedules = [];
  let weekNumbers = [];
  let currentWeekNumber = getWeekNumber(requestedDate); // Get current week number
  let volunteers = await databaseHandler.getVolunteers(); // Get all volunteer names
  
  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i=0; i<SCHEDULES_PER_MONTH; i++) {
    schedules.push(await databaseHandler.getScheduleForWeek(currentWeekNumber+i));
    weekNumbers.push(currentWeekNumber+i); // Corresponding weeknumbers will be used as table titles
  }

  // When the schedule is missing data for one or more days, calculate dates for the missing days
  let autoFilledSchedule = getAutoFilledSchedule(schedules, weekNumbers, DAYS_PER_WEEK);

  // Determine what is the most common month name in the schedules so it can be used as page title
  let mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];

  // Functions which are needed to display corresponding content
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
    toLocalDateString: (date) => { 
      // Use local time instead of UTC-time. This fixes shifting of time when a new schedule is added, which resulted in different days having the same date.
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
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
  let formData = req.body;

  for (const [data, dayParts] of Object.entries(formData)) {
    await databaseHandler.updateScheduleEntry (new Date(data), dayParts).catch(async (error) => {
      // On error create.
      await databaseHandler.addScheduleEntry(new Date(data), dayParts);
    });
  }
  res.redirect('/dashboard');
});

// Instructions manual page
app.get('/manuals', (req, res) => {
  res.render('pages/manuals', { activePage: 'manuals'});
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
