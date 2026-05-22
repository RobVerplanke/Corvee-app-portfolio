import { DateTime } from "luxon";

/**
 * Determine the ISO 8601 week number associated with the given date.
 *
 * @param {Date} date - The date for which to find the week number.
 * @returns {number} Corresponding week number
 */
function getWeekNumber(date) {
  return DateTime.fromJSDate(date).weekNumber;
}

/**
 * Determine the first Monday for the given ISO 8601 format week number.
 *
 * @param {number} year - The year to find the associated Monday for.
 * @param {number} weekNr - The week number to find the associated Monday for.
 * @returns {object} JavaScript Date equivalent to calculated DateTime
 */
function getMondayFromWeekNumber(year, weekNr) {
  // Use Luxon to retrieve the correct date by building an ISO string in YYYY-Www-D format.
  const weekStr = weekNr.toString().padStart(2, "0");
  return DateTime.fromISO(`${year}-W${weekStr}-1`).toJSDate();
}

/**
 * Determine the name of the day based on the given date
 *
 * @param {Date} date - The date to get the day name for
 * @returns {string} The name of the current day or empty string
 */
function getNameOfDay(date) {
  const DAY_NAMES = [
    "Zondag",
    "Maandag",
    "Dinsdag",
    "Woensdag",
    "Donderdag",
    "Vrijdag",
    "Zaterdag",
  ];
  return date === "" ? "" : DAY_NAMES[date.getDay()];
}

/**
 * Get today's date formatted as YYYY-MM-DD for use in date input fields
 *
 * @returns {string} Today's date in YYYY-MM-DD format
 */
function getTodayForDatepicker() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Adjust the long date notation to a more readable format
 *
 * @param {Date} date - The date to format
 * @returns {string}
 */
function formatDate(date) {
  // In case there is no date available, show placeholder content
  if (!date) return "Geen datum gevonden";

  const formattedDate = new Date(date).toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "long",
  });

  // In case there is a date available, return the first letters in capital
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
}

/**
 * Determine which month is the most common moth in the schedules, this will be used as page title
 *
 * @param {Array<Array<Object>>} schedules - Nested array of schedule objects containing dates
 * @returns {string} The name of the most common month
 */
function getMostCommonMonth(schedules) {
  const allMonths = [];

  // If there is a date, add the month of that date to the list
  schedules.map((schedule) => {
    schedule.map((day) => {
      if (day.date) {
        allMonths.push(day.date.getMonth());
      }
    });
  });

  // Count the amount of times a month occurs
  const monthCounts = {};
  allMonths.map((month) => {
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  // Return the most common month
  return Object.keys(monthCounts).reduce((a, b) =>
    monthCounts[a] > monthCounts[b] ? a : b,
  );
}

/**
 * Used in Dashboard view to automaticly add a date and a dropdown menu in case when that data is missing
 *
 * @param {Array<Array<Object>>} schedules - A list of all schedules
 * @param {number} year - Specify the year
 * @param {number[]} weekNumbers - Specify the week numbers
 * @param {number} DAYS_PER_WEEK - Amount of days per week
 * @returns {object[]} A list with prefilled schedules
 */
function getAutoFilledSchedule(schedules, year, weekNumbers, DAYS_PER_WEEK) {
  return schedules.map((schedule, index) => {
    const monday = getMondayFromWeekNumber(year, weekNumbers[index]);

    // Check the schedule for missing days and replace it with data
    while (schedule.length < DAYS_PER_WEEK) {
      const dayIndex = schedule.length; // Determine the day. 0=ma, 1=di, 2=wo, 3=do, 4=vr
      const date = new Date(monday);
      date.setDate(monday.getDate() + dayIndex);

      schedule.push({
        date: date,
        morning: { name: "-" },
        afternoon: { name: "-" },
      });
    }
    return schedule;
  });
}

/**
 * Capitalize first letter of a given name
 *
 * @param {string} val - A valid name
 * @returns {string} The name with a the first letter capitalized
 */
function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

/**
 * Validate the given name
 *
 * @param {string} name - Unvalidated name
 * @returns {boolean} True if the name is valid, false otherwise
 */
function isValidName(name) {
  const regex = /^[A-Za-z]{2,20}(?:[ -][A-Za-z]+)*$/;
  return regex.test(name);
}

export {
  getWeekNumber,
  getMondayFromWeekNumber,
  getNameOfDay,
  formatDate,
  getMostCommonMonth,
  getAutoFilledSchedule,
  capitalizeFirstLetter,
  isValidName,
  getTodayForDatepicker,
};
