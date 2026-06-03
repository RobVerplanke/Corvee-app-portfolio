import {
  getWeekNumber,
  getNameOfDay,
  formatDate,
  getMostCommonMonth,
  getAutoFilledSchedule,
  capitalizeFirstLetter,
  isValidName,
  getTodayForDatepicker,
} from "./helpers.js";
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import Sequelize from "sequelize";
// import Sqlite3 from "sqlite3";
import BetterSqlite3 from "better-sqlite3";
import DatabaseHandler from "./databaseHandler.js";
import { request } from "http";
import { readFileSync } from "fs";
import QRCode from "qrcode";
import { DateTime } from "luxon";

// Fill database at loading app
import { seedDatabase } from "./seed.js";

/**
 * Localization strings loaded from Dutch locale file
 * @type {Object}
 */
const t = JSON.parse(readFileSync("./locales/nl.json", "utf-8"));

/**
 * Array of month names in Dutch
 * @type {string[]}
 */
const MONTHS = t.common.months;

/**
 * Amount of schedules per month
 * @type {number}
 */
const SCHEDULES_PER_MONTH = 4;

/**
 * Amount of days per week
 * @type {number}
 */
const DAYS_PER_WEEK = 5;

// Admin password
const PASSWORD = process.env.ADMIN_PASSWORD || "654";

/**
 * Express application instance
 * @type {import('express').Application}
 */
const app = express();

/**
 * Port the server listens on
 * @type {number}
 */
const port = process.env.PORT || 3000;

/**
 * Absolute path to the current file
 * @type {string}
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Absolute path to the current directory
 */
const __dirname = path.dirname(__filename);

/**
 * Sequalize instance connected to the SQLite database
 * @type {Sequelize}
 */
const sequelize = new Sequelize({
  dialect: "sqlite",
  dialectModule: { Database: BetterSqlite3 },
  storage: "database.sqlite",
  logging: false,
});

/**
 * Wraps around the sequelize instance to provide a layer between the app and the database.
 * @type {object}
 */
const databaseHandler = new DatabaseHandler(sequelize);

// Synchronize the database so the tables exist in the database
await databaseHandler.sync();
await seedDatabase(databaseHandler);

// Use static files for CSS-styling, scripts and assets (images)
app.use(express.static(path.join(__dirname, "public")));

// Read form data (sent from dashboard) correctly
app.use(express.urlencoded({ extended: true }));

// Setup session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "TEMP_SECRET_KEY",
    resave: false,
    saveUninitialized: false,
  }),
);

// Use local JSON-file as textual content storage
app.use((req, res, next) => {
  res.locals.t = t;
  next();
});

// Make login-status globally available
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Set the view engine to ejs and build an absolute path to the views folder
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/**
 * Middleware that redirects to the login page if the user is not logged in
 * @param {import('express').Request} req - The incoming request object
 * @param {import('express').Response} res - The outgoing response object
 * @param {import('express').NextFunction} next - Callback to pass control to the next middleware
 */
function isLoggedIn(req, res, next) {
  if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Agenda page - Extra span-elements are used for the printed version
app.get("/", async (req, res) => {
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
  let year = requestedDate.getFullYear();

  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i = 0; i < SCHEDULES_PER_MONTH; i++) {
    schedules.push(
      await databaseHandler.getScheduleForWeek(year, currentWeekNumber + i),
    );
    weekNumbers.push(currentWeekNumber + i);
  }

  // When the schedule is missing data for one or more days, add placeholder content for the missing days
  let autoFilledSchedule = getAutoFilledSchedule(
    schedules,
    year,
    weekNumbers,
    DAYS_PER_WEEK,
  );

  // Determine what is the most common month name in the schedules so it can be uses as page title
  let mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];

  // Functions and data which are needed to display titles and dates in the agenda view
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
    capitalizeFirstLetter: capitalizeFirstLetter,
  };

  // Data that needs to be displayd
  const data = {
    schedules: autoFilledSchedule,
    weekNumbers: weekNumbers,
    mostCommonMonth: mostCommonMonth,
    requestedDate: req.query.date || getTodayForDatepicker(),
  };

  // activePage - function that highlights the corresponding navigation button of the active page
  res.render("pages/agenda", {
    activePage: "agenda",
    helper: helper,
    data: data,
  });
});

app.get("/login", (req, res) => {
  // If already logged in, redirect to the dashboard for admin use.
  if (req.session.isLoggedIn) {
    res.redirect("/dashboard");
  } else {
    // If not logged in, show login and any error if present.
    res.render("pages/login", { loginError: req.session.loginError });
  }
});

app.post("/login", (req, res) => {
  // Retrieve the posted data for authentication. Only password for now.
  const password = req.body.password;

  // Check if the login details are valid and create a session or reject the login attempt.
  if (password == PASSWORD) {
    // Create login session and redirect to the admin view
    req.session.isLoggedIn = true;
    res.redirect("/dashboard");
  } else {
    // Reject login, go back to login page and show warning
    req.session.loginError = true;
    res.redirect("/login");
  }
});

// Logout and return to agenda.
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
});

// Admin dashboard page
app.get("/dashboard", isLoggedIn, async (req, res) => {
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
  let year = requestedDate.getFullYear();
  let volunteers = await databaseHandler.getVolunteers(); // Get all volunteer names

  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i = 0; i < SCHEDULES_PER_MONTH; i++) {
    schedules.push(
      await databaseHandler.getScheduleForWeek(year, currentWeekNumber + i),
    );
    weekNumbers.push(currentWeekNumber + i); // Corresponding weeknumbers will be used as table titles
  }

  // When the schedule is missing data for one or more days, calculate dates for the missing days
  let autoFilledSchedule = getAutoFilledSchedule(
    schedules,
    year,
    weekNumbers,
    DAYS_PER_WEEK,
  );

  // Determine what is the most common month name in the schedules so it can be used as page title
  let mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];

  // Functions which are needed to display corresponding content
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
    capitalizeFirstLetter: capitalizeFirstLetter,
    toLocalDateString: (date) => {
      // Use local time instead of UTC-time. This fixes shifting of time when a new schedule is added, which resulted in different days having the same date.
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
  };

  // Data that needs to be displayd
  const data = {
    schedules: autoFilledSchedule,
    currentMonthName: mostCommonMonth,
    requestedDate: req.query.date || getTodayForDatepicker(),
    weekNumbers: weekNumbers,
    volunteers: volunteers,
  };

  // Alert messages
  const alerts = {
    success: req.query.success,
    removed: req.query.removed,
    edited: req.query.edited,
    error: req.query.error,
    errorDouble: req.query.errorDouble,
  };

  // activePage - function that highlights the corresponding navigation button of the active page
  res.render("pages/dashboard", {
    activePage: "dashboard",
    helper: helper,
    data: data,
    alerts: alerts,
  });
});

// Admin dashboard page - Save new schedule from form
app.post("/dashboard/save", isLoggedIn, async (req, res) => {
  let formData = req.body;

  for (const [data, dayParts] of Object.entries(formData)) {
    await databaseHandler
      .updateScheduleEntry(new Date(data), dayParts)
      .catch(async (error) => {
        // On error create.
        await databaseHandler.addScheduleEntry(new Date(data), dayParts);
      });
  }
  res.redirect("/dashboard?edited=true");
});

// Admin dashboard page - Add new volunteer after name validation
app.post("/dashboard/add", isLoggedIn, async (req, res) => {
  const formData = req.body;
  const newVolunteer = formData.newVolunteer;

  if (!isValidName(newVolunteer)) {
    // Regex validation
    res.redirect("/dashboard?error=true");
  } else {
    try {
      await databaseHandler.addVolunteer(newVolunteer);
      res.redirect("/dashboard?success=true");
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        res.redirect("/dashboard?errorDouble=true");
      } else {
        res.redirect("/dashboard?error=true");
      }
    }
  }
});

// Admin dashboard page - Remove existing volunteer
app.post("/dashboard/delete", isLoggedIn, (req, res) => {
  const formData = req.body;
  const volunteerId = formData.volunteerId;

  databaseHandler.removeVolunteer(volunteerId);
  res.redirect("/dashboard?removed=true");
});

app.post("/dashboard/copy", async (req, res) => {
  const copyDate = new Date(parseInt(req.body.copyDate));

  // Copy these four weeks forward to the next set.
  await databaseHandler.copyScheduleSet(copyDate);

  // Get the date four weeks forward for the redirect.
  const newDate = DateTime.fromJSDate(copyDate).plus({ weeks: 4 });

  // Redirect the page to show the copied four weeks.
  res.redirect(`/dashboard/?date=${newDate.toISODate()}`);
});

// Instructions manual page
app.get("/manuals", (req, res) => {
  res.render("pages/manuals", { activePage: "manuals", activeManual: "tasks" });
});

app.get("/manuals/tasks", (req, res) => {
  res.render("pages/manuals", { activePage: "manuals", activeManual: "tasks" });
});

app.get("/manuals/dishwasher", (req, res) => {
  res.render("pages/manuals", {
    activePage: "manuals",
    activeManual: "dishwasher",
  });
});

app.get("/manuals/cleaning", (req, res) => {
  res.render("pages/manuals", {
    activePage: "manuals",
    activeManual: "cleaning",
  });
});

// A clean agenda view to display on an external monitor
app.get("/monitor", async (req, res) => {
  const qrCode = await QRCode.toDataURL(
    process.env.APP_URL || "http://localhost:3000",
    {
      color: {
        dark: "#1C3269",
        light: "#00000000",
      },
    },
  );
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
  let year = requestedDate.getFullYear();

  // Get a fixed amount of schedules for the upcoming weeks (defined in SCHEDULES_PER_MONTH constant) of the current month
  for (let i = 0; i < SCHEDULES_PER_MONTH; i++) {
    schedules.push(
      await databaseHandler.getScheduleForWeek(year, currentWeekNumber + i),
    );
    weekNumbers.push(currentWeekNumber + i);
  }

  // When the schedule is missing data for one or more days, add placeholder content for the missing days
  let autoFilledSchedule = getAutoFilledSchedule(
    schedules,
    year,
    weekNumbers,
    DAYS_PER_WEEK,
  );

  // Determine what is the most common month name in the schedules so it can be uses as page title
  let mostCommonMonth = MONTHS[getMostCommonMonth(schedules)];

  // Functions and data which are needed to display titles and dates in the agenda view
  const helper = {
    getWeekNumber: getWeekNumber,
    getNameOfDay: getNameOfDay,
    formatDate: formatDate,
    capitalizeFirstLetter: capitalizeFirstLetter,
  };

  // Data that needs to be displayd
  const data = {
    schedules: autoFilledSchedule,
    weekNumbers: weekNumbers,
    mostCommonMonth: mostCommonMonth,
    requestedDate: req.query.date || getTodayForDatepicker(),
    qrCode,
  };

  // activePage - function that highlights the corresponding navigation button of the active page
  res.render("pages/monitor", {
    activePage: "agenda",
    helper: helper,
    data: data,
  });
});

// Eror page
app.use("/{*splat}", (req, res) => {
  res.render("pages/errorpage");
});

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
