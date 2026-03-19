const testData = {
  month: "April",
  weeks: [
  {
    title: "Week 1",
      schedules: [
        { day: "Maandag", date: "1 april", morning: "Harrie", afternoon: "Corrie" },
        { day: "Dinsdag", date: "2 april", morning: "Jan", afternoon: "Annie" },
        { day: "Woensdag", date: "3 april", morning: "Henk", afternoon: "Truus" },
        { day: "Donderdag", date: "4 april", morning: "Els", afternoon: "Els" },
        { day: "Vrijdag", date: "5 april", morning: "Jan", afternoon: "Truus" },
      ]},
    {
    title: "Week 2",
      schedules: [
        { day: "Maandag", date: "8 april", morning: "Jaap", afternoon: "Miep" },
        { day: "Dinsdag", date: "9 april", morning: "Niels", afternoon: "Jannie" },
        { day: "Woensdag", date: "10 april", morning: "Ed", afternoon: "Ed" },
        { day: "Donderdag", date: "11 april", morning: "Harrie", afternoon: "Harry" },
        { day: "Vrijdag", date: "12 april", morning: "Corrie", afternoon: "Jan" },
      ]
    },
    {
    title: "Week 3",
      schedules: [
        { day: "Maandag", date: "15 april", morning: "Jaap", afternoon: "Miep" },
        { day: "Dinsdag", date: "16 april", morning: "Niels", afternoon: "Jannie" },
        { day: "Woensdag", date: "17 april", morning: "Corrie", afternoon: "Jannie" },
        { day: "Donderdag", date: "18 april", morning: "Harrie", afternoon: "Ed" },
        { day: "Vrijdag", date: "19 april", morning: "Jaap", afternoon: "Koen" },
      ]
    },
    {
      title: "Week 4",
      schedules: [
        { day: "Maandag", date: "22 april", morning: "Els", afternoon: "Els" },
        { day: "Dinsdag", date: "21 april", morning: "Henk", afternoon: "Miep" },
        { day: "Woensdag", date: "22 april", morning: "Koen", afternoon: "Koen" },
        { day: "Donderdag", date: "23 april", morning: "Harrie", afternoon: "Harry" },
        { day: "Vrijdag", date: "24 april", morning: "Els", afternoon: "Jan" },
      ]
    }
  ]
};

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from 'sequelize';
import Sqlite3 from '@vscode/sqlite3';
import databaseHandler from 'databaseHandler';
import toggleCard from 'script/dashboard/dashboard.js'; // WERKT NIET

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: Sqlite3,
  // TODO: change this to a proper file location in future.
  storage: ':memory:',
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

// Agenda page - Different span elements are for the printed version
app.get('/agenda', async (req, res) => {
  const weeks = testData.weeks.map( week => {
    const rows = week.schedules.map( schedule => `
      <tr>
        <td class="td-dag" rowspan="2">${schedule.day}<span class="datum">${schedule.date}</span></td>
        <td><span class="badge badge-ochtend">Ochtend</span><span class="dagdeel-print">Ochtend</span></td>
        <td class="td-naam">${schedule.morning}</td>
      </tr>
      <tr>
        <td><span class="badge badge-middag">Middag</span><span class="dagdeel-print">Middag</span></td>
        <td class="td-naam td-naam-middag">${schedule.afternoon}</td>
      </tr>
      `).join('');

      return { title: week.title, rows: rows };
    });
    
    // The activePage function is used to highlight the corresponding navigation button of the active page
  res.render('pages/agenda', { activePage: 'agenda', weeks: weeks, tableMonth: testData.month });
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
